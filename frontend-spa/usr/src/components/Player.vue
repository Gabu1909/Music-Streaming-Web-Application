<template>
  <div>
    <div class="player-bar" v-if="currentSong" :class="{ 'hidden': !isVisible }">
      <div class="player-content">
        <div class="player-left">
          <div class="now-playing">
            <div class="song-info">
              <span class="song-title">{{ currentSong.title }}</span>
              <span class="song-artist">{{ currentSong.artist }}</span>
            </div>
          </div>
          <button
            v-if="userId"
            @click="toggleFavorite"
            class="favorite-btn"
            :class="{ 'favorited': isFavorited }"
            :disabled="isLoading"
            :title="isFavorited ? 'Remove from Favorites' : 'Add to Favorites'"
          >
            <i :class="isFavorited ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>
        </div>

        <div class="player-center">
          <div v-if="error" class="error-message">{{ error }}</div>
          <div class="play-controls">
            <button @click="prevSong" :disabled="!currentSong || isLoading" class="control-btn" title="Previous">
              <i class="fas fa-step-backward"></i>
            </button>
            <button @click="seekBackward" :disabled="!currentSong || isLoading" class="control-btn" title="Rewind 10s">
              <i class="fas fa-backward"></i>
            </button>
            <button @click="togglePlay" :disabled="!currentSong || isLoading" class="play-pause-btn">
              <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i></span>
              <span v-else-if="isPlaying"><i class="fas fa-pause"></i></span>
              <span v-else><i class="fas fa-play"></i></span>
            </button>
            <button @click="seekForward" :disabled="!currentSong || isLoading" class="control-btn" title="Forward 10s">
              <i class="fas fa-forward"></i>
            </button>
            <button @click="nextSong" :disabled="!currentSong || isLoading" class="control-btn" title="Next">
              <i class="fas fa-step-forward"></i>
            </button>
          </div>
          <div class="progress-container">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <input
              type="range"
              min="0"
              :max="duration || 0"
              :value="currentTime"
              @input="seek($event.target.value)"
              class="progress-slider"
              :disabled="isLoading || !duration"
            >
            <span class="duration">{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="player-right">
          <div class="volume-control">
            <i :class="volumeIcon"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              @input="setVolume($event.target.value)"
              class="volume-slider"
              title="Adjust Volume"
            >
          </div>
          <button @click="toggleVisibility" class="hide-btn" :title="isVisible ? 'Hide Player' : 'Show Player'">
            <i :class="isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
          </button>
        </div>
      </div>
    </div>
    <button
      v-if="currentSong && !isVisible"
      class="show-player-btn"
      @click="toggleVisibility"
      title="Show Player"
    >
      <i class="fas fa-chevron-up"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePlayer } from '@/store';
import { useAuth } from '@/hooks/useAuth';

const audioRef = ref(null);
const store = usePlayer();
const { userId } = useAuth(); // Get userId from useAuth
const isVisible = ref(true);

const currentSong = computed(() => store.currentTrack);
const isPlaying = computed(() => store.isPlaying);
const isLoading = computed(() => store.isLoading);
const volume = computed(() => store.volume);
const error = computed(() => store.error);
const currentTime = computed(() => store.currentTime);
const duration = computed(() => store.duration);
const favorites = computed(() => store.favorites);

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'fas fa-volume-mute';
  if (volume.value < 0.5) return 'fas fa-volume-down';
  return 'fas fa-volume-up';
});

const isFavorited = computed(() => {
  if (!currentSong.value || !favorites.value) return false;
  return favorites.value.some(fav => fav.songId === currentSong.value.id);
});

watch(favorites, (newFavorites) => {
  console.log('Favorites updated:', newFavorites);
}, { deep: true });

const toggleFavorite = async () => {
  if (!currentSong.value || !userId.value) {
    store.setError('Please log in to toggle favorites.');
    return;
  }
  try {
    if (isFavorited.value) {
      await store.removeFromFavorites(currentSong.value.id, userId.value);
    } else {
      await store.addToFavorites(currentSong.value.id, userId.value);
    }
    await store.loadFavorites(userId.value); // Refresh favorites list
  } catch (error) {
    console.error('Error toggling favorite:', error);
    store.setError('Failed to toggle favorite');
  }
};

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const seekForward = () => {
  if (currentSong.value && !isLoading.value) {
    store.seek(currentTime.value + 10);
  }
};

const seekBackward = () => {
  if (currentSong.value && !isLoading.value) {
    store.seek(Math.max(0, currentTime.value - 10));
  }
};

const nextSong = () => store.playNext();
const prevSong = () => store.playPrevious();
const setVolume = (value) => store.setVolume(value);
const seek = (time) => store.seek(time);
const togglePlay = () => store.togglePlay();

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

onMounted(() => {
  if (audioRef.value) store.initAudio(audioRef.value);
});
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, #1a1a2e 0%, #121222 100%);
  border-top: 1px solid #2a2a3d;
  z-index: 1001;
  display: flex;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.player-bar.hidden {
  transform: translateY(100%);
}

.player-bar:hover {
  background: linear-gradient(180deg, #22223b 0%, #121222 100%);
}

.player-content {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  gap: 32px;
}

.player-left {
  flex: 1.5;
  display: flex;
  align-items: center;
  gap: 16px;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 16px;
}

.song-info {
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.song-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.song-artist {
  font-size: 0.85rem;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.favorite-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s, transform 0.2s;
}

.favorite-btn.favorited {
  color: #de0aad;
}

.favorite-btn:hover:not(:disabled) {
  color: #fff;
  transform: scale(1.15);
}

.favorite-btn:disabled {
  color: #666;
  cursor: not-allowed;
}

.player-center {
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.play-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
}

.control-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 10px;
  transition: color 0.2s, transform 0.2s;
}

.control-btn:hover:not(:disabled) {
  color: #fff;
  transform: scale(1.15);
}

.control-btn:disabled {
  color: #666;
  cursor: not-allowed;
}

.play-pause-btn {
  background: #ae1db9;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.play-pause-btn:hover:not(:disabled) {
  background-color: #6a044f;
  transform: scale(1.1);
}

.play-pause-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  position: relative;
}

.progress-slider {
  width: 100%;
  height: 6px;
  background: #4a4a6a;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  accent-color: #b91da7;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #4b0458;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(87, 6, 108, 0.5);
}

.progress-slider:hover {
  background: #5a5a7a;
}

.progress-slider:disabled {
  background: #666;
  cursor: not-allowed;
}

.current-time,
.duration {
  font-size: 0.9rem;
  color: #b3b3b3;
  font-weight: 500;
}

.player-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b3b3b3;
}

.volume-slider {
  width: 120px;
  height: 6px;
  background: #4a4a6a;
  border-radius: 3px;
  cursor: pointer;
  accent-color: #a2068b;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #931069;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(79, 3, 57, 0.5);
}

.volume-slider:hover {
  background: #5a5a7a;
}

.hide-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s, transform 0.2s;
}

.hide-btn:hover {
  color: #fff;
  transform: scale(1.15);
}

.show-player-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: #ae1db9;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #fff;
  cursor: pointer;
  z-index: 1002;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s, transform 0.2s;
}

.show-player-btn:hover {
  background-color: #6a044f;
  transform: scale(1.1);
}

.error-message {
  color: #ff4b91;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .player-bar {
    height: 80px;
  }

  .player-content {
    padding: 0 16px;
    gap: 16px;
  }

  .player-left {
    flex: 1;
    gap: 10px;
  }

  .song-title,
  .song-artist {
    max-width: 120px;
  }

  .player-center {
    flex: 2;
  }

  .play-controls {
    gap: 20px;
  }

  .control-btn {
    font-size: 1rem;
  }

  .play-pause-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .favorite-btn {
    font-size: 1.1rem;
  }

  .volume-slider {
    width: 80px;
  }

  .progress-slider {
    height: 5px;
  }

  .hide-btn {
    font-size: 1rem;
  }

  .show-player-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .player-left {
    flex: 0.8;
  }

  .song-title,
  .song-artist {
    max-width: 80px;
    font-size: 0.8rem;
  }

  .volume-control {
    display: none;
  }

  .hide-btn {
    font-size: 0.9rem;
  }

  .show-player-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}
</style>
