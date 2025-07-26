<template>
  <div class="options-menu-container">
    <transition name="fade">
      <div v-if="isVisible" class="options-menu" :style="{ top: `${position.y}px`, left: `${position.x}px` }">
        <div class="menu-item" @click="handleOption('add-to-queue')" v-if="!isInQueue">
          <i class="fas fa-list"></i> Thêm vào hàng đợi
        </div>
        <div class="menu-item" @click="handleOption('remove-from-queue')" v-else>
          <i class="fas fa-trash-alt"></i> Xóa khỏi hàng đợi
        </div>

        <div class="menu-item" @click="handleOption('download')">
          <i class="fas fa-download"></i> Tải về
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePlayer } from '@/store';

const props = defineProps({
  isVisible: Boolean,
  position: Object,
  track: Object
});

const emit = defineEmits(['select', 'close']);
const playerStore = usePlayer();


const isInQueue = computed(() => {
  return playerStore.playlist.some(item => (item.song_id || item.id) === (props.track.song_id || props.track.id));
});

const handleOption = async (option) => {
  emit('select', { option, track: props.track });
  emit('close');
};
</script>

<style scoped>
.options-menu-container {
  position: relative;
}

.options-menu {
  position: fixed;
  z-index: 9999;
  background: #2a2a3a;
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 1px solid #3a3a5c;
}


.menu-item {

  padding: 10px 16px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: left;
  gap: 10px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(138, 43, 226, 0.3);
  color: #ffffff;
}

.menu-item i {
  width: 20px;
  text-align: center;
  color: #ff4b91;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
