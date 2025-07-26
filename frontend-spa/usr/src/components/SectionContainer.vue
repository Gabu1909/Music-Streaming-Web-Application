<template>
  <section class="section-container mb-5">
    <h2 class="section-title mb-4">{{ title }}</h2>
    <slot></slot>
  </section>
</template>

<script>
export default {
  name: 'SectionContainer',
  props: {
    title: String
  }
}
</script>

<style scoped>
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}
</style>
