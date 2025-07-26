<template>
  <div class="artist-detail">
    <div v-if="artist && (artist.id || artist.artist_id)" class="artist-header">
      <img class="artist-image" :src="getAvatarUrl(artist.avatar_url)" alt="Artist Image" />
      <div class="artist-info">
        <h1>{{ artist.name }}</h1>
        <p v-if="artist.bio" class="artist-bio">{{ artist.bio }}</p>
        <div class="artist-actions">
          <button class="play-btn" @click="playAllSongs" :disabled="!allSongs.length">Play All</button>
        </div>
      </div>
    </div>
    <div class="artist-content mt-4">
      <h2>Popular Tracks</h2>
      <TrackList :tracks="popularSongs" @play="playSongHandler" />
    </div>
    <div v-if="allSongs.length > popularSongs.length" class="artist-content mt-4">
      <h2>All Songs</h2>
      <TrackList :tracks="allSongs" @play="playSongHandler" />
    </div>
    <div v-if="artistAlbums && artistAlbums.length" class="artist-albums mt-5">
      <h2>Albums</h2>
      <div class="album-list">
        <div class="album-card" v-for="album in artistAlbums" :key="album.id">
          <router-link :to="`/albums/${album.album_id}`" class="album-card-link">
            <div class="album-card">
              <img class="album-cover" :src="getAlbumCover(album.cover_url)" alt="Album Cover" />
              <div class="album-title">{{ album.title }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    <audio ref="audioRef" preload="metadata"></audio>
    <PlayerView v-if="currentSong" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePlayer } from '@/store';
import { useArtist } from '@/hooks/useArtist';
import TrackList from '@/components/TrackList.vue';
import PlayerView from '@/components/Player.vue';

const route = useRoute();
const { currentSong, initAudio, playSong } = usePlayer();
const audioRef = ref(null);

const artistId = route.params.id;
const { artist, artistSongs, artistAlbums, isLoading, error, refetch } = useArtist(artistId);

const popularSongs = computed(() => artistSongs.value?.slice(0, 5) || []);
const allSongs = computed(() => artistSongs.value || []);

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '/default-artist.jpg';
  return `/${avatarPath.replace(/^public\//, '')}`;
};

const getAlbumCover = (path) => {
  if (!path) return '/default-album.jpg';
  return `/${path.replace(/^public\//, '')}`;
};

const playAllSongs = async () => {
  if (allSongs.value.length) {
    await playSong(allSongs.value[0], allSongs.value);
  }
};

const playSongHandler = async (song) => {
  await playSong(song, allSongs.value);
};

onMounted(async () => {
  if (audioRef.value) initAudio(audioRef.value);
});
</script>

<style scoped>
.artist-detail {
  padding: 30px 10px 80px 20px;
  width: 100%;
  color: #fff;
  background: linear-gradient(to bottom, #1a1a2e 0%, #121222 100%);
}

.artist-header {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 48px 32px;
  background: linear-gradient(180deg, #cc1f1f 0%, #121212 100%);
  border-radius: 12px;
  margin: 0 24px;
}

.artist-image {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.6);
}

.artist-info {
  flex: 1;
}

.artist-info h1 {
  font-size: 3.5rem;
  font-weight: bold;
  margin: 0;
}

.artist-bio {
  margin-top: 10px;
  font-size: 1.1rem;
  color: #ccc;
  max-width: 80%;
  line-height: 1.6;
}

.artist-actions {
  margin-top: 20px;
}

.play-btn {
  background-color: #1db954;
  color: #fff;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 32px;
  cursor: pointer;
  transition: 0.25s ease;
}

.play-btn:hover:not(:disabled) {
  background-color: #1ed760;
  transform: scale(1.05);
}

.play-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.artist-content,
.artist-albums {
  padding: 32px 24px;
}

.artist-content h2,
.artist-albums h2 {
  font-size: 1.8rem;
  margin-bottom: 16px;
  font-weight: 700;
  border-bottom: 2px solid #333;
  padding-bottom: 8px;
}

.album-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.album-card-link {
  text-decoration: none;
  color: inherit;
}

.album-card {
  width: 200px;
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.album-card:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.album-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
}

.album-title {
  margin-top: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

audio {
  display: none;
}

@media (max-width: 768px) {
  .artist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .artist-info h1 {
    font-size: 2.2rem;
  }

  .artist-bio {
    max-width: 100%;
    font-size: 0.95rem;
  }

  .album-card {
    width: 48%;
  }
}

@media (max-width: 480px) {
  .album-card {
    width: 100%;
  }
}
</style>

