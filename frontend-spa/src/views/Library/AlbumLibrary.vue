<template>
  <div class="album-library-view container-fluid">
    <div class="library-header row align-items-center mb-4">
      <div class="col-md-6">
        <h1 class="library-title">Album Library</h1>
      </div>
      <div class="col-md-6">
        <div class="search-controls d-flex">
          <input
            type="text"
            placeholder="Search albums..."
            class="search-input"
            v-model="searchQuery"
          />
          <button class="refresh-button btn ms-2" @click="refetch">
            <i class="fa fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="row justify-content-center py-5">
      <div class="col-12 text-center">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading albums...</div>
      </div>
    </div>

    <div v-else-if="error" class="row justify-content-center py-5">
      <div class="col-12 col-md-8 text-center">
        <div class="error-message">
          <i class="bi bi-exclamation-circle-fill"></i>
          <div class="my-2">{{ error.message }}</div>
          <button class="retry-button btn" @click="refetch">Try Again</button>
        </div>
      </div>
    </div>

    <div v-else>
      <section v-if="newAlbums.length" class="mb-5">
        <div class="row mb-3">
          <div class="col">
            <h2 class="section-title">New Releases</h2>
          </div>
        </div>
        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3">
          <div class="col" v-for="album in newAlbums" :key="'new-' + album.album_id">
            <AlbumCard
              :title="album.title"
              :artist="album.artist_name || 'Unknown Artist'"
              :cover_url="album.cover_url"
              :songData="{}"
              @click="goToAlbum(album.album_id)"
              @play="playAlbum(album.album_id)"
            />
          </div>
        </div>
      </section>

      <section v-if="topAlbums.length" class="mb-5">
        <div class="row mb-3">
          <div class="col">
            <h2 class="section-title">Top Albums</h2>
          </div>
        </div>
        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3">
          <div class="col" v-for="album in topAlbums" :key="'top-' + album.album_id">
            <AlbumCard
              :title="album.title"
              :artist="album.artist_name || 'Unknown Artist'"
              :cover_url="album.cover_url"
              :songData="{}"
              :play_count="album.play_count"
              @click="goToAlbum(album.album_id)"
              @play="playAlbum(album.album_id)"
            />
          </div>
        </div>
      </section>

      <section v-if="rawAlbums.length">
        <div class="row align-items-center mb-3">
          <div class="col-md-6">
            <h2 class="section-title">All Albums</h2>
          </div>
          <div class="col-md-6 d-flex justify-content-md-end align-items-center">
            <div class="album-count me-3">{{ albums.length }} {{ albums.length === 1 ? 'album' : 'albums' }}</div>
            <select class="sort-select form-select" v-model="sortOption" style="width: auto;">
              <option v-for="option in sortOptions" :value="option.value" :key="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="albums.length" class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3">
          <div class="col" v-for="album in albums" :key="album.album_id">
            <AlbumCard
              :title="album.title"
              :artist="album.artist_name || 'Unknown Artist'"
              :cover_url="album.cover_url"
              :songData="{}"
              @click="goToAlbum(album.album_id)"
              @play="playAlbum(album.album_id)"
            />
          </div>
        </div>

        <div v-else class="row justify-content-center py-5">
          <div class="col-12 text-center">
            <div class="no-results-message">
              <i class="bi bi-search"></i>
              <h3>No albums found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <div v-else class="row justify-content-center py-5">
        <div class="col-12 col-md-8 text-center">
          <div class="empty-state">
            <i class="bi bi-collection"></i>
            <h3>No albums found</h3>
            <p>It seems you don't have any albums yet.</p>
            <button class="action-button btn">Upload Album</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { usePlayer } from '@/store';
import AlbumCard from '@/components/common/AlbumCard.vue';
import albumService from '@/services/album.service';

const router = useRouter();
const player = usePlayer();
const queryClient = useQueryClient();
const searchQuery = ref('');
const sortOption = ref('recent');

const sortOptions = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
];

// Fetch albums using vue-query
const { data: rawAlbums, isLoading, error, refetch } = useQuery({
  queryKey: ['albums'],
  queryFn: async () => {
    const response = await albumService.getAllAlbums();
    return response.data.albums.map(album => ({
      ...album,
      artist_name: album.artist_name || 'Unknown Artist',
    })) || [];
  },
  onError: (err) => {
    console.error('Failed to fetch albums:', err);
  },
});

const albums = computed(() => {
  let result = [...(rawAlbums.value || [])];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(album =>
      album.title.toLowerCase().includes(query) ||
      (album.artist_name && album.artist_name.toLowerCase().includes(query))
    );
  }

  switch (sortOption.value) {
    case 'title-asc':
      return result.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return result.sort((a, b) => b.title.localeCompare(a.title));
    case 'recent':
    default:
      return result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
});

const newAlbums = computed(() => {
  return [...(rawAlbums.value || [])]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 6);
});

const topAlbums = computed(() => {
  return [...(rawAlbums.value || [])]
    .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
    .slice(0, 6);
});

async function playAlbum(albumId) {
  try {
    const album = await albumService.getAlbumDetails(albumId);
    const songs = album.songs || [];
    if (songs.length) {
      const normalizedSongs = songs.map(song => ({
        ...song,
        id: song.song_id || song.id,
        audio_url: song.audio_url || '',
        artist: song.artist || album.artist_name || 'Unknown Artist',
      }));
      player.setCurrentTrack(normalizedSongs[0]);
      player.setQueue(normalizedSongs);
      player.play();
    } else {
      console.error('No songs found in album');
      queryClient.setQueryData(['albums', 'error'], 'No songs available in this album.');
    }
  } catch (err) {
    console.error('Failed to play album:', err);
    queryClient.setQueryData(['albums', 'error'], 'Failed to play album. Please try again.');
  }
}

function goToAlbum(albumId) {
  router.push(`/albums/${albumId}`);
}
</script>

<style scoped>
.album-library-view {
  padding: 2rem;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.library-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(90deg, #ff5ebc 0%, #7b61ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.search-controls {
  display: flex;
  gap: 0.75rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  min-width: 250px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(123, 97, 255, 0.3);
}

.refresh-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  color: #ff5ebc;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background: rgba(123, 97, 255, 0.3);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.album-count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.sort-select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(123, 97, 255, 0.2);
  border-radius: 50%;
  border-top-color: #7b61ff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 1rem;
  text-align: center;
  color: #ff5555;
}

.error-message svg {
  color: #ff5555;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 85, 85, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.retry-button:hover {
  background: rgba(255, 85, 85, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state svg {
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.empty-state p {
  margin: 0.5rem 0 1.5rem;
  max-width: 400px;
}

.action-button {
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #ff5ebc 0%, #7b61ff 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(123, 97, 255, 0.3);
}

.no-results-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 2rem;
}

.no-results-message svg {
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.no-results-message h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.no-results-message p {
  margin: 0.5rem 0 0;
}

@media (max-width: 768px) {
  .album-library-view {
    padding: 1rem;
  }

  .library-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    min-width: 100%;
  }
}
</style>
