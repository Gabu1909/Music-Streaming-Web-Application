<template>
  <div class="song-item" @click="$emit('song-click', song)">
    <div class="song-cover">
      <img
        :src="song.image_url || '/uploads/img/default-cover.jpg'"
        :alt="`${song.title} cover`"
        class="cover-image"
        loading="lazy"
        @error="handleImageError"
      />
    </div>
    <div class="song-details">
      <h4 class="song-title">{{ song.title }}</h4>
      <p class="song-artist">{{ song.artist }}</p>
    </div>
    <div class="song-actions">
      <button class="play-btn" @click.stop="play">
        <i class="bi bi-play-fill"></i>
      </button>
      <button class="favorite-btn" @click.stop="toggleFavorite" :class="{ 'active': song.isFavorite }">
        <i class="bi bi-heart-fill"></i>
      </button>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  song: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: 'Unknown Song',
      artist: 'Unknown Artist',
      image_url: '',
      duration: 0,
      isFavorite: false
    })
  }
});

const emit = defineEmits(['song-click', 'toggle-favorite']);

const play = () => {
  emit('song-click', props.song);
};

const toggleFavorite = () => {
  emit('toggle-favorite', props.song);
};

const handleImageError = (event) => {
  event.target.src = '/uploads/img/default-cover.jpg';
};
</script>

<style scoped>
.song-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  background-color: rgba(60, 2, 65, 0.8);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.song-item:hover {
  background-color: rgba(133, 117, 129, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(255, 77, 77, 0.2);
}

.song-cover {
  width: 70px;
  height: 70px;
  margin-right: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.song-details {
  flex-grow: 1;
  overflow: hidden;
}

.song-title {
  font-size: 1.4rem;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 1rem;
  color: #b3b3b3;
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn, .favorite-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.4rem;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.play-btn:hover, .favorite-btn:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ff4444;
}

@media (max-width: 768px) {
  .song-item {
    padding: 10px;
  }

  .song-cover {
    width: 50px;
    height: 50px;
  }

  .song-title {
    font-size: 1rem;
  }

  .song-artist {
    font-size: 0.8rem;
  }

  .play-btn, .favorite-btn {
    font-size: 1.2rem;
  }
}
</style>
