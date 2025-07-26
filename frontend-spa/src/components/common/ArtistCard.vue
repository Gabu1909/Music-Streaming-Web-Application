<template>
  <div class="artist-card text-center" @click="navigateToArtist">
    <div class="artist-image-container mx-auto mb-3">
      <img
        :src="artistImageUrl"
        class="artist-image rounded-circle"
        :alt="artist.name"
        loading="lazy"
      >
      <div class="play-button-overlay">
        <button class="play-button" @click.stop="handlePlay">
          <i class="fas fa-play"></i>
        </button>
      </div>
      <div v-if="artist.genre" class="artist-badge">
        {{ artist.genre }}
      </div>
    </div>

    <h5 class="artist-name text-truncate">{{ artist.name }}</h5>
    <p v-if="artist.followers" class="artist-label text-muted">
      {{ formatFollowers(artist.followers) }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { usePlayer } from '@/store';


const router = useRouter();
const { playSong } = usePlayer();
const defaultArtistImage = '/uploads/img/default-playlist.png';

const props = defineProps({
  artist: {
    type: Object,
    required: true,
    validator: (value) => {
      return (value.artist_id) && value.name;
    }
  }
});

const emit = defineEmits(['play']);

const artistImageUrl = computed(() => {
  const url = props.artist.avatar_url;
  if (!url) return defaultArtistImage;
  return url.startsWith('/') ? '/' + url.replace('/', '') : url;
});

const artistId = computed(() => props.artist.artist_id);

const { data: songs, refetch } = useQuery({
  queryKey: ['artistSongs', artistId],
  queryFn: async () => {
    const response = await artistService.getArtistSongs(artistId.value);
    return response?.data?.songs || response.songs || [];
  },
  enabled: false,
});

const handlePlay = async (e) => {
  e.stopPropagation();
  try {
    const { data } = await refetch();
    if (data.length) {
      await playSong(data[0], data);
      emit('play', artistId.value);
    } else {
      console.error('No songs available for artist:', artistId.value);
    }
  } catch (err) {
    console.error('Failed to play artist songs:', err);
  }
};

const navigateToArtist = () => {
  console.log('Navigating to artist:', artistId.value);
  router.push({
    name: 'artist-detail',
    params: { id: artistId.value.toString() }
  });
};

const formatFollowers = (count) => {
  if (!count) return '0 followers';
  return count >= 1000000
    ? `${(count / 1000000).toFixed(1)}M followers`
    : count >= 1000
    ? `${(count / 1000).toFixed(1)}K followers`
    : `${count} followers`;
};
</script>

<style scoped>
.artist-card {
  cursor: pointer;
  padding: 16px;
  transition: all 0.3s ease;
  border-radius: 12px;
  width: 100%;
  max-width: 180px;
}

.artist-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.05);
}

.artist-image-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 16px;
}

.artist-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.artist-card:hover .artist-image {
  box-shadow: 0 12px 28px rgba(0,0,0,0.4);
}

.play-button-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(10px);
}

.artist-card:hover .play-button-overlay {
  opacity: 1;
  transform: translateY(0);
}

.play-button {
  width: 40px;
  height: 40px;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
  background: #1ed760;
}

.artist-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
}

.artist-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 8px 0 4px;
  color: white;
}

.artist-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

@media (max-width: 768px) {
  .artist-card {
    padding: 12px;
    max-width: 140px;
  }

  .artist-image-container {
    width: 120px;
    height: 120px;
  }
}
</style>
