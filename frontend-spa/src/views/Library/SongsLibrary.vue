<template>
  <div class="library-songs">
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading your library songs...</p>
    </div>

    <div v-else-if="!songs.length" class="empty-state">
      <i class="fas fa-music"></i>
      <h4>No songs in your library</h4>
      <p>Start by adding some songs to your collection</p>
      <button class="btn btn-primary" @click="fetchSongs">
        Refresh
      </button>
    </div>

    <div v-else class="song-list-container">
      <div class="list-header">
        <h2>Your Library</h2>
        <div class="stats">
          <span class="badge bg-primary">{{ songs.length }} songs</span>
          <span class="last-updated">Last updated: {{ lastUpdated }}</span>
        </div>
      </div>

      <div class="song-list">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="song-item"
          :class="{ 'active': currentSongId === song.id }"
          @click="playSong(song, index)"
        >
          <div class="song-number">{{ index + 1 }}</div>

          <div class="song-info">
            <img :src="song.cover" :alt="song.title" class="song-cover">
            <div class="song-details">
              <h5 class="song-title">{{ song.title }}</h5>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
          </div>

          <div class="song-album">{{ song.album }}</div>

          <div class="song-duration">
            {{ formatDuration(song.duration) }}
            <button class="btn btn-sm btn-outline-secondary more-btn">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const songs = ref([])
const loading = ref(true)
const currentSongId = ref(null)
const lastUpdated = ref(new Date().toLocaleDateString())

const fetchSongs = async () => {
  loading.value = true
  try {

    const response = await axios.get('http://localhost:3000/api/songs')
    songs.value = response.data.data.songs.map(song => ({
      id: song.song_id,
      title: song.title,
      artist: song.artist_name || song.artist?.name || 'Unknown Artist',
      album: song.album_name || song.album?.name || 'No Album',
      duration: song.duration || 0,
      cover: song.image_url || 'https://via.placeholder.com/50'
    }))

    lastUpdated.value = new Date().toLocaleDateString()
  } catch (error) {
    console.error('Failed to fetch songs:', error)
  } finally {
    loading.value = false
  }
}

const playSong = (song, index) => {
  currentSongId.value = song.id

  console.log('Playing:', song.title, 'at index:', index)
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchSongs()
})
</script>
<style scoped>
.library-songs {
  padding: 20px;
  color: var(--text-color);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 15px;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: var(--primary-color);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.last-updated {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.song-list {
  background: var(--bg-secondary);
  border-radius: 10px;
  overflow: hidden;
}

.song-item {
  display: grid;
  grid-template-columns: 50px 3fr 2fr 100px;
  align-items: center;
  padding: 12px 20px;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.song-item:hover {
  background: var(--bg-hover);
  cursor: pointer;
}

.song-item.active {
  background: var(--bg-active);
}

.song-item.active .song-title {
  color: var(--primary-color);
}

.song-number {
  color: var(--text-muted);
  text-align: center;
  font-weight: 500;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  object-fit: cover;
}

.song-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin: 5px 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
}

.more-btn {
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.song-item:hover .more-btn {
  opacity: 1;
}

@media (max-width: 768px) {
  .song-item {
    grid-template-columns: 40px 1fr 80px;
    grid-template-areas:
      "number info duration"
      ". album .";
    gap: 10px;
    padding: 15px;
  }

  .song-number {
    grid-area: number;
  }

  .song-info {
    grid-area: info;
  }

  .song-album {
    grid-area: album;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .song-duration {
    grid-area: duration;
  }

  .more-btn {
    display: none;
  }
}
</style>
