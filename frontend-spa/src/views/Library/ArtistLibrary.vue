<template>
  <div class="artists-view">
    <div class="hero-banner" :style="{ backgroundImage: 'url(/uploads/img/cover-artist.jpg)' }">
      <div class="overlay">
        <div class="container">
          <h1 class="hero-title">Artists Hub</h1>
          <p class="hero-subtitle">Unleash the sound of tomorrow</p>
          <button @click="scrollToArtists" class="explore-btn">Explore Now</button>
        </div>
      </div>
    </div>

    <div class="container py-8">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Syncing artists...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p class="error-text">{{ error.message }}</p>
        <button @click="refetch" class="retry-btn">Retry Sync</button>
      </div>

      <div v-else>
        <div class="section py-4" v-if="sortedArtists.length > 0">
          <h2 class="section-title">Spotlight Artists</h2>
          <div class="featured-slider">
            <ArtistCard
              v-for="artist in sortedArtists.slice(0, 5)"
              :key="artist.artist_id"
              :artist="artist"
              @click="viewArtist(artist.artist_id)"
              class="featured-card"
            />
          </div>
        </div>
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Artist Gallery</h2>
            <div class="sort-options">
              <select v-model="sortBy" class="form-select" @change="refetch">
                <option value="popular">Top Hits</option>
                <option value="newest">Latest Additions</option>
                <option value="a-z">Alphabetical</option>
              </select>
            </div>
          </div>
          <div class="artist-masonry">
            <ArtistCard
              v-for="artist in sortedArtists"
              :key="artist.id"
              :artist="artist"
              @click="viewArtist(artist.artist_id)"
              class="masonry-card"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import ArtistCard from '@/components/common/ArtistCard.vue';
import artistService from '@/services/artist.service';

const router = useRouter();
const sortBy = ref('popular');

const { data: artists, isLoading, error, refetch } = useQuery({
  queryKey: ['artists', sortBy],
  queryFn: async () => {
    const apiResponse = await artistService.getAllArtists({ sort: sortBy.value });
    const artistsData = apiResponse?.data?.artists ||
                       apiResponse?.artists ||
                       (Array.isArray(apiResponse) ? apiResponse : []);
    if (!artistsData.length) {
      throw new Error('Artist database empty');
    }
    return artistsData;
  },
});

const sortedArtists = computed(() => {
  if (!artists.value) return [];
  const artistsCopy = [...artists.value];
  switch (sortBy.value) {
    case 'popular':
      return artistsCopy.sort((a, b) => (b.followers || 0) - (a.followers || 0));
    case 'newest':
      return artistsCopy.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    case 'a-z':
      return artistsCopy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    default:
      return artistsCopy;
  }
});

const viewArtist = (artistId) => {
  if (!artistId) {
    console.error('Invalid artist ID');
    return;
  }
  router.push({ name: 'artist-detail', params: { id: artistId } });
};

const scrollToArtists = () => {
  document.querySelector('.section').scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.artists-view {
  color: #fff;
  background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
  width: 100%;
}

.hero-banner {
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
  display: flex;
  align-items: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent 60%);
}

.container {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(29, 185, 84, 0.7);
  margin-bottom: 20px;
  animation: fadeInUp 1s ease-out;
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 600px;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  animation: fadeInUp 1.2s ease-out;
}

.explore-btn {
  padding: 12px 30px;
  background: linear-gradient(90deg, #1db954, #17a34a);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 20px;
}

.explore-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(29, 185, 84, 0.5);
}

.section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sort-options {
  width: 240px;
}

.form-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 15px;
  padding: 8px 15px;
  font-size: 1rem;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.form-select:focus {
  box-shadow: 0 0 0 0.2rem rgba(29, 185, 84, 0.4);
  outline: none;
}

.featured-slider {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 0;
  scroll-behavior: smooth;
}

.featured-card {
  min-width: 200px;
  transition: transform 0.3s ease;
}

.featured-card:hover {
  transform: scale(1.05);
}

.artist-masonry {
  columns: 4;
  column-gap: 20px;
}

.masonry-card {
  break-inside: avoid;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.masonry-card:hover {
  transform: translateY(-5px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  gap: 2rem;
  color: #b3b3b3;
}

.loading-text {
  font-size: 1.2rem;
  text-transform: uppercase;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  gap: 2rem;
  color: #ff4d4f;
}

.error-text {
  font-size: 1.2rem;
  text-align: center;
  max-width: 400px;
}

.retry-btn {
  padding: 0.7rem 1.5rem;
  background: #1db954;
  border: none;
  border-radius: 25px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #17a34a;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .hero-title {
    font-size: 3.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .artist-masonry {
    columns: 3;
  }
}

@media (max-width: 768px) {
  .hero-banner {
    height: 80vh;
    background-attachment: scroll;
  }

  .hero-title {
    font-size: 2.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .sort-options {
    width: 100%;
  }

  .artist-masonry {
    columns: 2;
  }

  .featured-slider {
    justify-content: flex-start;
  }

  .featured-card {
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .hero-banner {
    height: 60vh;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .artist-masonry {
    columns: 1;
  }

  .featured-card {
    min-width: 150px;
  }

  .section-title {
    font-size: 1.8rem;
  }
}
</style>
