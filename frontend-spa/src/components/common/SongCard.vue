<template>
  <div class="song-card" @click="playSong">
    <div class="song-image">
      <img :src="image_url" :alt="title" />
      <button class="play-button">
        <i class="bi bi-play-fill"></i>
      </button>
    </div>
    <div class="song-info">
      <h4 class="song-title">{{ title }}</h4>
      <p class="song-artist">{{ artist }}</p>
      <div class="song-meta">
        <span class="song-duration">{{ duration }}</span>
        <button class="song-action">
          <i class="bi bi-heart"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      default: '0:00'
    },
    songData: Object
  },
  methods: {
    playSong() {
      this.$emit('play', {
        title: this.title,
        artist: this.artist,
        song: this.songData
      });
    }
  }
}
</script>

<style scoped>
.song-card {
  background: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.song-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.song-image {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.song-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.song-card:hover .play-button {
  opacity: 1;
  transform: translateY(0);
}

.song-info {
  padding: 12px;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.song-duration {
  font-size: 12px;
  color: var(--text-secondary);
}

.song-action {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0;
}

.song-action:hover {
  color: var(--primary-color);
}
</style>
