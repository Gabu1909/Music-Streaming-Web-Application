<template>
  <div class="playlist-library">
    <div class="banner">
      <img src="/uploads/img/playlist-banner.jpg" alt="Playlist Banner" class="banner-img" />
      <div class="banner-overlay">
        <h1>Explore Your Favorite Playlists</h1>
        <p>Listen, discover, and enjoy hand-curated music collections.</p>
      </div>
    </div>

    <div class="library-header mt-4">
      <h1 class="library-title"> <i class="fas fa-music"></i> Playlists</h1>
      <button class="create-btn" @click="showCreateModal = true">
        <i class="fas fa-plus"></i>
        <span>New Playlist</span>
      </button>
    </div>

    <CreatePlaylistModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @create="handlePlaylistCreation"
    />

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading playlists...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="fetchPlaylists" class="retry-btn">Try Again</button>
    </div>

    <div v-else class="playlist-content">
      <section v-if="topPlaylists.length" class="playlist-section">
        <h2 class="section-title">Top Playlists</h2>
        <div class="playlist-grid">
          <PlaylistCard
            v-for="playlist in topPlaylists"
            :key="playlist.id"
            :id="playlist.id"
            :name="playlist.name"
            :image="playlist.image"
            :song-count="playlist.song_count"
            @play="playPlaylist"
          />
        </div>
      </section>

      <section v-if="userPlaylists.length" class="playlist-section">
        <h2 class="section-title">Your Playlists</h2>
        <div class="playlist-grid">
          <PlaylistCard
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            :id="playlist.id"
            :name="playlist.name"
            :image="playlist.image"
            :song-count="playlist.song_count"
            @play="playPlaylist"
          />
        </div>
      </section>

      <section v-if="systemPlaylists.length" class="playlist-section">
        <h2 class="section-title">Suggested Playlists</h2>
        <div class="playlist-grid">
          <PlaylistCard
            v-for="playlist in systemPlaylists"
            :key="playlist.id"
            :id="playlist.id"
            :name="playlist.name"
            :image="playlist.image"
            :song-count="playlist.song_count"
            @play="playPlaylist"
          />
        </div>
      </section>

      <div v-if="!userPlaylists.length && !systemPlaylists.length && !topPlaylists.length" class="no-playlists">
        <p>No playlists available. Create one or check back later!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePlayer } from '@/store';
import { playlistService } from '@/services/playlist.service';
import PlaylistCard from '@/components/common/PlaylistCard.vue';
import CreatePlaylistModal from '@/components/CreatePlaylistModal.vue';

const { playSong } = usePlayer();
const loading = ref(true);
const error = ref(null);
const showCreateModal = ref(false);
const defaultPlaylistImage = '/uploads/img/default-playlist.png';

const playlists = ref([]);

const topPlaylists = computed(() => playlists.value.filter(p => p.is_top));
const userPlaylists = computed(() => playlists.value.filter(p => !p.is_system && !p.is_top));
const systemPlaylists = computed(() => playlists.value.filter(p => p.is_system && !p.is_top));

const fetchPlaylists = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await playlistService.getAllPlaylists();

    if (response.status !== 'success' || !Array.isArray(response.data)) {
      throw new Error('Expected an array of playlists in response.data');
    }

    playlists.value = response.data.map(playlist => {
      let songCount = 0;
      if ('song_count' in playlist) {
        songCount = playlist.song_count;
      }
      else if (Array.isArray(playlist.songs)) {
        songCount = playlist.songs.length;
      }
      else if ('songs_count' in playlist) {
        songCount = playlist.songs_count;
      }

      return {
        ...playlist,
        id: playlist.playlist_id || playlist.id,
        song_count: songCount,
        image: playlist.image_url || defaultPlaylistImage,
      };
    });
  } catch (err) {
    error.value = 'Failed to load playlists. Please try again.';
    console.error('Error fetching playlists:', err);
  } finally {
    loading.value = false;
  }
};

const handlePlaylistCreation = async (playlistData) => {
  try {
    await playlistService.createPlaylist(playlistData);
    showCreateModal.value = false;
    await fetchPlaylists();
  } catch (err) {
    error.value = 'Failed to create playlist.';
    console.error('Error creating playlist:', err);
  }
};

const playPlaylist = async (playlistId) => {
  try {
    const response = await playlistService.getPlaylistDetails(playlistId);
    const playlist = response.data || response;
    const songs = playlist.songs || [];
    if (songs.length) {
      await playSong(songs[0], songs.map(song => ({ ...song, audio_url: song.audio_url || '' })));
    } else {
      error.value = 'No songs available in this playlist.';
    }
  } catch (err) {
    error.value = 'Failed to play playlist.';
    console.error('Error playing playlist:', err);
  }
};

onMounted(() => {
  fetchPlaylists();
});
</script>

<style scoped>
.playlist-library {
  padding: 2rem;
  color: white;
  background: linear-gradient(to bottom, #1a1a2e, #380e0e);
  min-height: 100vh;
}

.banner {
  position:relative;
  height: auto;
  width: 100%;

}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 3rem;
}

.banner-overlay h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.banner-overlay p {
  font-size: 1.2rem;
  color: #ccc;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.library-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #ff4da6, #9b59b6);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.playlist-content {
  max-width: 1200px;
  margin: 0 auto;
}

.playlist-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ddd;
  margin-bottom: 1rem;
  border-bottom: 2px solid #333;
  padding-bottom: 0.5rem;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff4da6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: #ff4d4f;
}

.retry-btn {
  padding: 0.5rem 1.5rem;
  background: #ff4da6;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #e6008c;
}

.no-playlists {
  text-align: center;
  color: #bbb;
  padding: 2rem;
}

@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .library-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .library-title {
    font-size: 2rem;
  }
}
</style>
