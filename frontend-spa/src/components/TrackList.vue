<template>
  <div class="track-list">
    <div class="track-list-header">
      <div>#</div>
      <div>Title</div>
      <div>Artist</div>
      <div><i class="fas fa-clock"></i></div>
    </div>

    <div
      v-for="(track, index) in tracks"
      :key="track.song_id || track.id"
      :class="{ active: isCurrentTrack(track) }"
      class="track-item"
      @click="playTrack(track)"
    >
      <div class="track-index">
        <span class="position">{{ index + 1 }}</span>
        <button class="play-btn" @click.stop="playTrack(track)">
          <i :class="isCurrentTrack(track) && player.isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
      </div>
      <div class="track-info">
        <span class="track-title">{{ track.title }}</span>
        <span v-if="track.explicit" class="explicit-badge">E</span>
      </div>
      <div class="track-artist">{{ track.artist }}</div>
      <div class="track-duration">
        {{ formatDuration(track.duration) }}
        <button class="more-btn" @click.stop="showTrackOptions($event, track)">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </div>

    <TrackOptionsMenu
      v-if="showOptions"
      :is-visible="showOptions"
      :position="menuPosition"
      :track="selectedTrack"
      @select="handleMenuSelect"
      @click.stop
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePlayer } from '@/store';
import TrackOptionsMenu from '@/components/TrackOptionsMenu.vue';

const props = defineProps({
  tracks: {
    type: Array,
    required: true,
  },
});

const player = usePlayer(); // Use the player store

const showOptions = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const selectedTrack = ref(null);

const isCurrentTrack = (track) => {
  const trackId = track.song_id || track.id;
  const currentId = player.currentTrack?.id;
  return currentId === trackId;
};

const playTrack = async (track) => {
  const normalized = await player.normalizeSongData(track);

  if (!normalized.audioUrl) {
    console.error('No audio URL for track:', normalized);
    return;
  }

  const isCurrent = isCurrentTrack(normalized);
  if (isCurrent) {
    await player.togglePlay();
  } else {
    await player.playSong(normalized, props.tracks);
  }
};

const showTrackOptions = (event, track) => {
  selectedTrack.value = track;

  const buttonRect = event.currentTarget.getBoundingClientRect();
  const menuHeight = 150;
  const padding = 8;

  const x = buttonRect.left;
  let y = buttonRect.top - menuHeight - padding;

  if (y < 0) {
    y = buttonRect.bottom + padding;
  }

  menuPosition.value = { x, y };
  showOptions.value = true;

  const closeMenu = (e) => {
    if (!e.target.closest('.options-menu')) {
      showOptions.value = false;
      document.removeEventListener('click', closeMenu);
    }
  };
  document.addEventListener('click', closeMenu);
};

const handleMenuSelect = async ({ option, track }) => {
  try {
    switch (option) {
      case 'add-to-queue':
        await player.addToQueue(track);
        break;
      case 'remove-from-queue':
        await player.removeFromQueue(track);
        break;
      case 'download':
        downloadTrack(track);
        break;
    }
  } catch (error) {
    console.error('Error handling menu option:', error);
  }
};

const downloadTrack = (track) => {
  if (!track.audio_url) return;

  const link = document.createElement('a');
  link.href = track.audio_url;
  link.download = `${track.title}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
</script>
<style>
.track-list {
  color: #e0e0e0;
  font-size: 1rem;
  margin-top: 24px;
  border-radius: 12px;
  background: #1a1a2e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}


.track-list-header {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 60px;
  padding: 8px 16px;
  background: #292946;
  font-size: 20px;
  font-weight: 600;
  text-transform: uppercase;
  color: #ffdfdf;
  border-bottom: 1px solid #3a3a5c;
}


.track-item {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 60px;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #202036;
  transition: background 0.15s ease;
  cursor: pointer;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.track-item.active {
  background-color: rgba(255, 75, 145, 0.1);
}

.track-item.active .track-title {
  color: #ff4b91;
}

/* Index column */
.track-index {
  position: relative;
  text-align: center;
  font-weight: 600;
  color: #888;
}

/* Number or play icon */
.position {
  transition: opacity 0.2s ease;
}

.play-btn {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
}

.track-item:hover .position {
  display: none;
}

.track-item:hover .play-btn {
  display: block;
}

/* Title + explicit badge */
.track-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.track-title {
  font-weight: 500;
  color: #ffffff;
  overflow: hidden;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.explicit-badge {
  background: #ff4b91;
  color: #fff;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
}

/* Artist name */
.track-artist {
  color: #aaaaaa;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Duration and menu */
.track-duration {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #cccccc;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

.more-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  opacity: 0;
  padding: 4px;
  transition: opacity 0.2s ease;
}

.track-item:hover .more-btn {
  opacity: 1;
}

/* Responsive tweaks */
@media (max-width: 768px) {
  .track-list-header {
    grid-template-columns: 40px 4fr 80px;
    padding: 10px 16px;
  }

  .track-item {
    grid-template-columns: 40px 4fr 80px;
    padding: 10px 16px;
  }

  .track-artist {
    display: none;
  }
}
</style>
