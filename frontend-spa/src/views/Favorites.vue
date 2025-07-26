<template>
  <div class="favorites">
    <div class="container py-6">
      <div class="text-center mb-6">
        <h1 class="display-3 fw-bold text-white position-relative">
          <i class="bi bi-heart-fill text-danger me-3"></i>
          <span class="title-text">Favorite Songs</span>
          <div class="underline"></div>
        </h1>
        <p class="lead text-light opacity-80 mt-2">A collection of your favorite tunes</p>
      </div>

      <div v-if="loading" class="text-center py-6">
        <div class="spinner-container">
          <div class="spinner"></div>
        </div>
        <p class="text-light mt-4 fs-5">Loading favorites...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger text-center rounded-3 shadow-sm" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
        <button v-if="error.includes('logged in')" class="btn btn-danger ms-3 py-1" @click="$router.push('/login')">Login</button>
        <button v-else class="btn btn-warning ms-3 py-1" @click="fetchFavorites">Try Again</button>
      </div>

      <div v-else-if="player.favorites.length === 0" class="text-center py-6">
        <i class="bi bi-music-note-list display-1 text-light opacity-50"></i>
        <p class="text-light mt-3 fs-4">No favorite songs yet. Add some!</p>
        <a href="/discover" class="btn btn-outline-light mt-3 px-4 py-2">Discover Songs</a>
      </div>

      <div v-else class="favorites-list row g-4">
        <div v-for="song in player.favorites" :key="song?.song_id" class="col-12 col-md-6 col-lg-4">
          <div class="favorite-item card h-100 shadow-sm">
            <SongItem
              :song="song"
              @song-click="handlePlay"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { usePlayer } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import SongItem from '@/components/SongItem.vue';

const player = usePlayer();
const auth = useAuth();
const { userId } = auth;
const loading = ref(true);
const error = ref(null);

console.log('Auth object:', auth);

const fetchFavorites = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!userId.value) {
      error.value = 'Please log in to view your favorites.';
      throw new Error('User not logged in');
    }

    const response = await player.loadFavorites(userId.value);
    if (!response || !response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data from server');
    }

    player.state.favorites = response.data;
  } catch (err) {
    error.value = err.message || 'Failed to load favorites.';
    console.error('Fetch favorites error:', err);
  } finally {
    loading.value = false;
  }
};

const handlePlay = (songData) => {
  player.playSong(songData);
};

const handleToggleFavorite = (songData) => {
  if (!userId.value) {
    error.value = 'Please log in to toggle favorites.';
    return;
  }
  player.toggleFavorite(songData.song_id, !songData.isFavorite, userId.value);
};

onMounted(() => {
  console.log('userId on mount:', userId.value);
  if (userId.value) {
    fetchFavorites();
  } else {
    loading.value = false;
    error.value = 'Please log in to view your favorites.';
  }
});

watch(() => userId.value, (newUserId) => {
  console.log('userId changed to:', newUserId);
  if (newUserId) {
    fetchFavorites();
  }
});
</script>

<style scoped>
.favorites {
  color: #e0e0e0;
  background: linear-gradient(135deg, #2d122b 0%, #2a2a44 50%, #121212 100%);
  min-height: 100vh;
  padding-top: 4rem;
}

.container {
  max-width: 1400px;
}

.title-text {
  position: relative;
  z-index: 1;

}

.underline {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #ff8fd4);
  border-radius: 2px;
}

.alert {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem;
  background: rgba(255, 77, 77, 0.1);
  border: none;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e0e0;
  border-top: 5px solid #ff4d4d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-outline-light {
  border-color: #e0e0e0;
  color: #e0e0e0;
  transition: all 0.3s ease;
}

.btn-outline-light:hover {
  background-color: #ff8fd4;
  border-color: #ff8fd4;
  color: #121212;
}

.btn-danger, .btn-warning {
  padding: 0.4rem 1.5rem;
  font-size: 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background-color: #ff1a1a;
}

.btn-warning:hover {
  background-color: #ffcc00;
}

.favorites-list {
  --bs-gutter-x: 1.5rem;
}

.favorite-item {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 77, 77, 0.2);
}

.card {
  background: transparent;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .favorites-list .col-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .display-3 {
    font-size: 2rem;
  }

  .lead {
    font-size: 1rem;
  }
}
</style>
