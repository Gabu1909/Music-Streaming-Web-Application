<template>
  <div
    class="playlist-card"
    @click="handleCardClick"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div class="playlist-image">
      <img :src="image || defaultImage" :alt="name" @error="handleImageError" />
      <button v-show="hovered" class="play-btn" @click.stop="handlePlay">
        <i class="fas fa-play"></i>
      </button>
    </div>

    <div class="playlist-info">
      <h3 class="playlist-title">{{ name }}</h3>
      <p class="song-count">{{ songCount }} song{{ songCount !== 1 ? 's' : '' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayer } from '@/store/index';
import { useQuery } from '@tanstack/vue-query';


const props = defineProps({
  id: [Number, String],
  name: String,
  image: String,
  songCount: Number,
});

const emit = defineEmits(['play']);

const defaultImage = '/uploads/img/default-playlist.png';
const hovered = ref(false);
const router = useRouter();
const { playSong } = usePlayer();

const { data: playlist, refetch } = useQuery({
  queryKey: ['playlist', props.id],
  queryFn: () => playlistService.getPlaylistDetails(props.id),
  enabled: false,
});

const handleCardClick = () => {
  router.push({ name: 'playlist-detail', params: { id: props.id.toString() } }).catch(console.error);
};

const handlePlay = async () => {
  try {
    const { data } = await refetch();
    const songs = data?.songs || [];
    if (songs.length) {
      await playSong(songs[0], songs.map((song) => ({ ...song, audio_url: song.audio_url || '' })));
      emit('play', props.id);
    }
  } catch (err) {
    console.error('Failed to play playlist:', err);
  }
};

const handleImageError = (e) => {
  e.target.src = defaultImage;
};
</script>
<style scoped>
.playlist-card {
  background: linear-gradient(135deg, #a438f7, #7f0395);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  max-width: 220px;
  width: 100%;
}

.playlist-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.playlist-image {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.playlist-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.playlist-image img:hover {
  opacity: 0.9;
}

.play-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 42px;
  height: 42px;
  background: linear-gradient(45deg, #ff4da6, #9b59b6);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease, background 0.2s ease;
}

.play-btn:hover {
  background: linear-gradient(45deg, #ff3399, #8e44ad);
  transform: scale(1.1);
}

.playlist-info {
  padding: 1rem;
  text-align: center;
}

.playlist-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-count {
  margin: 0;
  color: #bbb;
  font-size: 0.9rem;
}


@media (max-width: 768px) {
  .playlist-card {
    max-width: 180px;
  }
}

@media (max-width: 480px) {
  .playlist-card {
    max-width: 150px;
  }

  .playlist-title {
    font-size: 1rem;
  }
}
</style>
