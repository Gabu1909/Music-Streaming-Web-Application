
<template>
  <div id="app">
    <router-view />
    <audio ref="audioRef" preload="metadata"></audio>
    <Player />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlayer } from '@/store';
import Player from '@/components/Player.vue';

const audioRef = ref(null);
const { initAudio } = usePlayer();

onMounted(() => {
  if (audioRef.value) initAudio(audioRef.value);
});
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
  background: #121222;
  color: #fff;
}
</style>
