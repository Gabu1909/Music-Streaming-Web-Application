<template>
  <div class="album-detail">
    <div v-if="isLoading || isSongsLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading album details...</p>
    </div>

    <div v-else-if="error || songsError" class="error">
      <p>{{ error?.message || songsError?.message || 'Failed to load album data' }}</p>
      <button @click="refetchAll" class="retry-btn">Retry</button>
    </div>

    <div v-else class="album-container">
      <div class="album-header">
        <AlbumCard
          :title="album.title || 'Untitled Album'"
          :artist="album.artist_name || 'Unknown Artist'"
          :cover_url="getAlbumCover(album.cover_url)"
          :songData="album.songs"
          @click="playAllSongs"
          @play="playAllSongs"
        />
      </div>

      <div class="album-content">
        <h2>Tracks</h2>
        <TrackList
          :tracks="albumSongs || []"
          @more="handleTrackMore"
          @play="handleTrackPlay"
        />
      </div>

      <audio ref="audioRef" preload="metadata"></audio>
      <MusicPlayer v-if="currentSong" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { usePlayer } from '@/store';
import albumService from '@/services/album.service';
import TrackList from '@/components/TrackList.vue';
import AlbumCard from '@/components/common/AlbumCard.vue';
import MusicPlayer from '@/components/Player.vue';

const route = useRoute();
const audioRef = ref(null);
const { currentSong, initAudio, playSong } = usePlayer();

const { data: album, isLoading, error, refetch } = useQuery({
  queryKey: ['album', route.params.id],
  queryFn: async () => {
    const response = await albumService.getAlbumDetails(route.params.id);
    return response.data?.album || {};
  },
  onError: (err) => {
    console.error('Failed to fetch album details:', err);
  },
});

const { data: albumSongs, isLoading: isSongsLoading, error: songsError, refetch: refetchSongs } = useQuery({
  queryKey: ['albumSongs', route.params.id],
  queryFn: async () => {
    const response = await albumService.getAlbumSongs(route.params.id);
    return response.data?.songs || [];
  },
  onError: (err) => {
    console.error('Failed to fetch album songs:', err);
  },
});

const getAlbumCover = (url) => {
  return url ? `/${url.replace(/^public\//, '')}` : '/default-album.jpg';
};

const getFullAudioUrl = (song) => {
  return song.audio_url ? `/${song.audio_url.replace(/^public\//, '')}` : '';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const handleImageError = (event) => {
  event.target.src = '/default-album.jpg';
};

const playAllSongs = async () => {
  const playlist = (albumSongs.value || []).map(song => ({
    ...song,
    audioUrl: getFullAudioUrl(song),
  }));
  if (playlist.length) {
    await playSong(playlist[0], playlist);
  }
};

const handleTrackPlay = async (track) => {
  const playlist = (albumSongs.value || []).map(song => ({
    ...song,
    audioUrl: getFullAudioUrl(song),
  }));
  await playSong(track, playlist);
};

const handleTrackMore = (track) => {
  console.log('Track options:', track);
};


const refetchAll = async () => {
  await Promise.all([refetch(), refetchSongs()]);
};

onMounted(async () => {
  await nextTick();
  if (audioRef.value) initAudio(audioRef.value);
});
</script>


<style scoped>

.album-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 32px;
  padding: 48px 32px;
  background: linear-gradient(180deg, #8602a4 0%, #121212 100%);
  border-radius: 20px;
  margin: 0 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.artist-name {
  font-size: 1.2rem;
  color: #ccc;
  margin: 8px 0;
}

.album-desc {
  color: #b3b3b3;
  margin: 8px 0;
  line-height: 1.5;
}

.release-date {
  color: #b3b3b3;
  font-size: 0.9rem;
}

.album-actions {
  margin-top: 16px;
}

.play-btn {
  background: #1db954;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-btn:hover:not(:disabled) {
  background: #1ed760;
  transform: scale(1.05);
}

.play-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.album-content {
  padding: 24px;
}

.album-content h2 {
  font-size: 1.6rem;
  margin-bottom: 16px;
  font-weight: 600;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #ccc;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #ff4d4d;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

audio {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .album-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .album-cover {
    width: 180px;
    height: 180px;
  }

  .album-info h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .album-header {
    padding: 20px;
  }

  .album-cover {
    width: 150px;
    height: 150px;
  }
}
</style>
