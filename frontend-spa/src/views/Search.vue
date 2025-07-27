<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import searchService from '@/services/search.service'
import { usePlayer  } from '@/store/index'
import ArtistCard from '@/components/common/ArtistCard.vue'
import PlaylistCard from '@/components/common/PlaylistCard.vue'
import AlbumCard from '@/components/common/AlbumCard.vue'
import SongCard from '@/components/common/SongCard.vue'
const getArtistName = (song) => {
  if (Array.isArray(song.artists) && song.artists.length > 0) {
    return song.artists.map(a => a.name || 'Unknown').join(', ');
  }
  if (typeof song.artist === 'string') return song.artist;
  if (song.artist && song.artist.name) return song.artist.name;
  return 'Unknown Artist';
};
const getSongImage = (song) => {
  if (!song) return null;
  if (song.image_url) return song.image_url;
  if (song.thumbnail) return song.thumbnail;

  if (song.album && song.album.cover_url) return song.album.cover_url;

  if (song.artist) {
    if (song.artist.avatar_url) return song.artist.avatar_url;
    if (song.artist.image_url) return song.artist.image_url;
  }

  return '/uploads/img/default-cover.jpg';
};

const formatDuration = (duration) => {
  if (!duration) return '0:00';
  if (typeof duration === 'string' && duration.includes(':')) return duration;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
const route = useRoute()
const router = useRouter()
const player = usePlayer()
const searchQuery = ref('')
const searchResults = ref({
  artists: [],
  playlists: [],
  albums: [],
  songs: []
})
const isLoading = ref(false)
const error = ref(null)

async function fetchSearchResults(query) {
  if (!query) return
  isLoading.value = true
  error.value = null
  try {
    const response = await searchService.search(query)
    searchResults.value = {
      artists: response.data.artists || [],
      playlists: response.data.playlists || [],
      albums: response.data.albums || [],
      songs: response.data.songs || []
    }
  } catch (err) {
    console.error('Search failed:', err)
    error.value = 'Failed to fetch search results. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function goToArtist(artistId) {
  router.push(`/artists/${artistId}`)
}

function goToPlaylist(playlistId) {
  router.push(`/playlists/${playlistId}`)
}

function goToAlbum(albumId) {
  router.push(`/albums/${albumId}`)
}

function playSong(song) {
  player.setCurrentTrack(song)
  player.play()
}

onMounted(() => {
  searchQuery.value = route.query.q || ''
  fetchSearchResults(searchQuery.value)
})

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || ''
  fetchSearchResults(searchQuery.value)
})
</script>

<template>
  <div class="search-view">
    <h1 class="search-title">Search Results for "{{ searchQuery }}"</h1>

    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <section v-if="searchResults.songs.length" class="results-section">
</section>

      <section v-if="searchResults.artists.length" class="results-section">
        <h2 class="section-title">Artists</h2>
        <div class="results-grid">
          <ArtistCard
            v-for="artist in searchResults.artists"
            :key="artist.artist_id"
            :artist="artist"
            @click="goToArtist(artist.artist_id)"
          />
        </div>
      </section>
      <section v-if="searchResults.playlists.length" class="results-section">
        <h2 class="section-title">Playlists</h2>
        <div class="results-grid">
          <PlaylistCard
            v-for="playlist in searchResults.playlists"
            :key="playlist.playlist_id"
            :playlist="playlist"
            @click="goToPlaylist(playlist.playlist_id)"
          />
        </div>
      </section>
      <section v-if="searchResults.albums.length" class="results-section">
        <h2 class="section-title">Albums</h2>
        <div class="results-grid">
          <AlbumCard
            v-for="album in searchResults.albums"
            :title="album.title"
            :cover_url="album.cover_url"
            :key="album.album_id"
            :album="album"
            @click="goToAlbum(album.album_id)"
          />
        </div>
      </section>

      <div
        v-if="!searchResults.artists.length && !searchResults.playlists.length && !searchResults.albums.length && !searchResults.songs.length"
        class="no-results"
      >
        No results found for "{{ searchQuery }}".
      </div>
    </div>
  </div>
</template>
<style scoped>
.search-view {
  padding: 20px;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.search-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff5ebc;
  margin-bottom: 30px;
}

.results-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.loading {
  font-size: 1.2rem;
  color: #ff5ebc;
  text-align: center;
  margin-top: 50px;
}

.error {
  font-size: 1.2rem;
  color: #ff5555;
  text-align: center;
  margin-top: 50px;
}

.no-results {
  font-size: 1.2rem;
  color: #ccc;
  text-align: center;
  margin-top: 50px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-view {
    padding: 15px;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .search-title {
    font-size: 1.5rem;
  }
}
</style>
