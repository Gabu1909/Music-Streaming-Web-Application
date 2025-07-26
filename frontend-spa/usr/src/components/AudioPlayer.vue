
<template>
  <div v-if="currentSong" class="bg-dark text-white p-3 fixed-bottom shadow">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <strong>{{ currentSong.title }}</strong><br />
        <small>{{ currentSong.artist }}</small>
      </div>
      <audio ref="audio" :src="currentSong.src" controls autoplay />
    </div>
  </div>
</template>

<script setup>
import { defineProps, watch, ref } from 'vue'

const props = defineProps({
  currentSong: Object
})

const audio = ref(null)

watch(() => props.currentSong, () => {
  if (audio.value) {
    audio.value.load()
    audio.value.play()
  }
})
</script>
