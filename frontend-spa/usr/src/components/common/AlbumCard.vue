<template>
  <div class="media-card" :class="{ 'has-description': description }" @click="$emit('click')">
    <div class="card-image-container">
      <img :src="getAlbumCover(cover_url) || '/uploads/img/default-cover.jpg'" class="card-image" :alt="`${title} cover`" loading="lazy">
      <button
        v-if="showPlayButton"
        class="play-button"
        @click.stop="handlePlayClick"
        :disabled="isLoading || !songData"
      >
        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
        <i v-else-if="isPlaying" class="fas fa-pause"></i>
        <i v-else class="fas fa-play"></i>
      </button>
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      <p v-if="artist" class="card-subtitle">{{ artist }}</p>
      <p v-if="description" class="card-description">{{ description }}</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePlayer } from '@/store/index';

export default {
  name: 'MediaCard',
  props: {
    title: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    cover_url: {
      type: String,
      required: true
    },
    showPlayButton: {
      type: Boolean,
      default: true
    },
   songData: Object,
  },
  emits: ['click', 'play'],
  setup(props, { emit }) {
    const player = usePlayer();

    const isPlaying = computed(() => {
  if (!props.songData || (!props.songData.id && !props.songData._id)) return false;
  const currentId = player.state.currentSong?.id;
  const songId = props.songData.id || props.songData._id;
  return currentId === songId && player.state.isPlaying;
});

const isLoading = computed(() => {
  if (!props.songData || (!props.songData.id && !props.songData._id)) return false;
  const currentId = player.state.currentSong?.id;
  const songId = props.songData.id || props.songData._id;
  return player.state.isLoading && currentId === songId;
});
const getAlbumCover = (url) => {
  if (!url) return '/default-artist.jpg';
  let cleanedUrl = url.replace(/^\/?public\//, '');
  if (cleanedUrl.startsWith('/uploads/')) {
    cleanedUrl = cleanedUrl.slice(1);
  }

  return '/' + cleanedUrl;
};

const handlePlayClick = async () => {
  if (!props.songData || (!props.songData.id && !props.songData._id)) {
    emit('play');
    return;
  }

  emit('play', props.songData);

  try {
    const songId = props.songData.id || props.songData._id;
    if (player.state.currentSong?.id !== songId) {
      await player.playSong(props.songData);
      return;
    }
    if (player.state.currentSong) {
      await player.togglePlay();
    } else {
      await player.playSong(props.songData);
    }
  } catch (err) {
    console.error('Error playing song:', err);
  }
};

    return {
      isPlaying,
      isLoading,
      handlePlayClick,
      getAlbumCover
    };
  }
};
</script>

<style scoped>
.media-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.media-card:hover {
  background: rgba(40, 40, 40, 0.7);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

.media-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.media-card:hover::before {
  background: linear-gradient(90deg, transparent, var(--accent-color, #1db954), transparent);
  height: 2px;
}

.card-image-container {
  position: relative;
  margin-bottom: 16px;
  aspect-ratio: 1;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.play-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: #6a1a50;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.play-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.media-card:hover .play-button {
  opacity: 1;
  transform: translateY(0);
}

.play-button i {
  font-size: 14px;
  margin-left: 2px;
}

.card-body {
  padding: 0;
  min-height: 60px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin-top: 8px;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.has-description .card-body {
  min-height: 80px;
}
</style>
