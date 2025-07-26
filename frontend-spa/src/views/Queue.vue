<template>
  <div class="queue-page">
    <div class="container py-6">
      <div class="text-center mb-6">
        <h1 class="display-4 fw-bold text-white position-relative">Queue</h1>
        <div class="underline"></div>
      </div>

      <div v-if="playlist && playlist.length" class="queue-list row g-4">
        <div v-for="(song, index) in playlist" :key="index" class="col-12 col-md-6 col-lg-4">
          <div class="queue-item card h-100 shadow-sm">
            <SongItem
              :song="song"
              @song-click="playSong(index)"
              @toggle-favorite="toggleFavorite"
            >
              <template #actions>
                <button class="move-top-btn" @click.stop="moveToTop(index)" title="Move to Top">
                  <i class="fas fa-arrow-up"></i>
                </button>
                <button class="remove-btn" @click.stop="removeSong(index)" title="Remove">
                  <i class="fas fa-trash"></i>
                </button>
              </template>
            </SongItem>
          </div>
        </div>
      </div>

      <div v-else class="no-queue text-center py-6">
        <i class="bi bi-music-note-list display-1 text-light opacity-50"></i>
        <p class="text-light mt-3 fs-4">No songs in queue. Add some to get started!</p>
        <a href="/discover" class="btn btn-outline-light mt-3 px-4 py-2">Discover Songs</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayer } from '@/store/index'
import SongItem from '@/components/SongItem.vue'

const player = usePlayer()

const playlist = computed(() => player.playlist || [])

const playSong = (index) => {
  if (playlist.value[index]) {
    player.playSong(playlist.value[index], playlist.value)
  }
}

const removeSong = (index) => {
  if (playlist.value[index]) {
    player.removeFromPlaylist(index)
  }
}

const toggleFavorite = (song) => {
  if (song) {
    player.toggleFavorite(song)
  }
}

const moveToTop = (index) => {
  const song = playlist.value[index]
  if (song) {
    player.removeFromPlaylist(index)
    player.addToPlaylist(song, 0)
  }
}
</script>

<style scoped>
.queue-page {
  color: #e0e0e0;
  background: linear-gradient(135deg, #1a1a2e 0%, #2a2a44 50%, #121212 100%);
  min-height: 100vh;
  padding-top: 4rem;
}

.container {
  max-width: 1400px;
}

.display-4 {
  font-size: 2.5rem;
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

.queue-list {
  --bs-gutter-x: 1.5rem;
}

.queue-item {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.queue-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 77, 77, 0.2);
}

.card {
  background: transparent;
}

.move-top-btn, .remove-btn {
  background: #ff4d4d;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  margin-left: 8px;
}

.move-top-btn {
  background: #4da6ff;
}

.move-top-btn:hover {
  background: #66b3ff;
  transform: scale(1.1);
}

.remove-btn:hover {
  background: #ff6666;
  transform: scale(1.1);
}

.no-queue {
  min-height: calc(100vh - 200px);
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

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .queue-list .col-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .display-4 {
    font-size: 2rem;
  }
}
</style>
