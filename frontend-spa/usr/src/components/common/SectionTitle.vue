<template>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="fw-bold">{{ title }}</h5>
    <a href="#" class="small text-decoration-none">Tất cả</a>
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>
