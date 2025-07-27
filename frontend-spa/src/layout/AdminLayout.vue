<template>
  <div class="admin-layout flex min-h-screen bg-dark text-white">
    <AdminSidebar />

    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '@/layout/admin.Sidebar.vue'
</script>

