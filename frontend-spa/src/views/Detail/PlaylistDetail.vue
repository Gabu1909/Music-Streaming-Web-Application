<template>
  <div class="playlist-detail">
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back
      </button>
      <h1 class="detail-title">Playlist Details</h1>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading playlist...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error.message }}</p>
      <button @click="refetch" class="retry-btn">Try Again</button>
    </div>

    <div v-else-if="playlist" class="playlist-content">
      <div class="playlist-info">
        <PlaylistCard
          :title="playlist.name"
          :image="playlist.image"
          :description="`${playlist.song_count} song${playlist.song_count !== 1 ? 's' : ''}`"
          @play="playPlaylist"
        />
      </div>

      <section v-if="playlist.songs?.length" class="songs-section">
        <h3 class="section-title">Songs</h3>
        <TrackList :tracks="playlist.songs" @play="playSong" @queue="addToQueue" />
      </section>
      <p v-else class="no-songs">No songs in this playlist.</p>
    </div>

    <div v-else class="no-playlist">
      <p>No playlist found.</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { usePlayer } from '@/store/index';
import { usePlaylist } from '@/hooks/usePlaylist';
import TrackList from '@/components/TrackList.vue';
import PlaylistCard from '@/components/common/PlaylistCard.vue';

const route = useRoute();
const router = useRouter();
const player = usePlayer();

const playlistId = route.params.id;
const { playlist, isLoading, error, refetch } = usePlaylist(playlistId);

const playPlaylist = async () => {
  try {
    const songs = playlist.value?.songs || [];
    if (songs.length) {
      if (player.isPlaying && player.currentTrack?.id === songs[0].id) {
        await player.togglePlay();
      } else {
        await player.playSong(songs[0], songs);
      }
    } else {
      error.value = 'No songs available to play.';
    }
  } catch (err) {
    error.value = 'Failed to play playlist.';
    console.error('Error playing playlist:', err);
  }
};

const playSong = async (song) => {
  try {
    const songs = playlist.value?.songs || [];
    if (song && songs.length) {
      if (player.isPlaying && player.currentTrack?.id === song.id) {
        await player.togglePlay();
      } else {
        await player.playSong(song, songs);
      }
    } else {
      error.value = 'No song available to play.';
    }
  } catch (err) {
    error.value = 'Failed to play song.';
    console.error('Error playing song:', err);
  }
};

const addToQueue = async (song) => {
  try {
    if (song) {
      await player.addToQueue(song);
    } else {
      error.value = 'No song to add to queue.';
    }
  } catch (err) {
    error.value = 'Failed to add song to queue.';
    console.error('Error adding to queue:', err);
  }
};

const goBack = () => {
  router.push({ view: '@/view/Library/PlaylistLibrary' });
};
</script>
<style scoped>

.playlist-detail {
  padding: 2rem;
  color: white;
  background: linear-gradient(to bottom, #1a1a2e, #121212);
  min-height: 100vh;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #444;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: #555;
}

.detail-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.playlist-content {
  max-width: 1200px;
  margin: 0 auto;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.playlist-image {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}

.playlist-title {
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
}

.song-count {
  color: #bbb;
  font-size: 1rem;
}

.play-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #ff4da6, #9b59b6);
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.songs-section {
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

.loading-state,
.error-state,
.no-playlist {
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
  to {
    transform: rotate(360deg);
  }
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
}

.retry-btn:hover {
  background: #e6008c;
}

.no-playlist {
  color: #bbb;
}

@media (max-width: 768px) {
  .detail-title {
    font-size: 2rem;
  }

  .playlist-image {
    max-width: 200px;
  }
}
</style>
