<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { usePlayer } from '@/store'
import {useAuth} from '@/hooks/useAuth'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const showUserMenu = ref(false)
const { userId, logout, showToast } = useAuth()
const user = ref({ name: '', avatar: '', isOnline: false })
const browseItems = [
  { path: '/', icon: 'fas fa-home', label: 'Home' },
  { path: '/playlists', icon: 'fas fa-music', label: 'Playlists' },
  { path: '/artists', icon: 'fas fa-microphone-alt', label: 'Artists' },
  { path: '/albums', icon: 'fas fa-compact-disc', label: 'Albums' },
]

const libraryItems = [
  { path: '/favorites', icon: 'fas fa-heart', label: 'Favorites' },
  { path: '/queue', icon: 'fas fa-list', label: 'Queue' },
]
const isActive = (path) => {
  return computed(() => route.path === path || route.path.startsWith(path + '/'))
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const getAvatarUrl = (url) => {
  if (!url) return 'uploads/img/default-usr.jpg';
  let cleanedUrl = url.replace(/^\/?public\//, '');
  if (cleanedUrl.startsWith('/uploads/')) {
    cleanedUrl = cleanedUrl.slice(1);
  }

  return '/' + cleanedUrl;
};

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) showUserMenu.value = false
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
    closeMobileMenu()
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  showUserMenu.value = false
}

function toggleUserMenu() {
  if (userId.value) {
    showUserMenu.value = !showUserMenu.value
  } else {
    goToLogin()
  }
}

function goToSettings() {
  router.push('/settings')
  showUserMenu.value = false
  closeMobileMenu()
}

function goToLogin() {
  router.push('/login')
  closeMobileMenu()
}

const { data: userData, isLoading, isError } = useQuery({
  queryKey: ['user'],
  queryFn: async () => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (token && userId) {
      const response = await authService.getUser()
      if (response.status === 'success' && response.data && response.data.user_id) {
        return response.data
      }
      throw new Error('Invalid user data')
    }
    throw new Error('No token or userId')
  },
  retry: 1,
  enabled: !!localStorage.getItem('token') && !!localStorage.getItem('userId'),
})


watch(userData, (newUserData) => {
  if (newUserData) {
    user.value = {
      name: newUserData.username || newUserData.email || 'User',
      avatar: newUserData.avatar_url || '/default-avatar.jpg',
      isOnline: true,
    }
  } else if (isError.value) {
    user.value = { name: '', avatar: '', isOnline: false }
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
  }
})

async function handleLogout() {
  try {
    await logout()
    user.value = { name: '', avatar: '', isOnline: false }
    showUserMenu.value = false
  } catch (error) {
    showToast('Logout failed', 'error')
  }
}

const player = usePlayer()
const currentSong = computed(() => player.currentTrack)
const isPlaying = computed(() => player.isPlaying)

const toggleNowPlaying = () => {
  if (currentSong.value) {
    player.togglePlay()
  }
}
</script>

<template>
  <div class="app-layout">
    <header class="mobile-header d-lg-none">
      <button class="mobile-toggle" @click="toggleMobileMenu">
        <i class="fas fa-bars"></i>
      </button>
      <div class="mobile-logo">
        <i class="fas fa-music"></i>
        <span>MyMusic</span>
      </div>
      <div class="mobile-user" @click="toggleUserMenu">
        <img v-if="userId" :src="getAvatarUrl(user.avatar)" class="user-avatar" :alt="user.name">
        <i v-else class="fas fa-user" style="font-size: 1.5rem; color: #ff5ebc;"></i>
        <div v-if="userId && showUserMenu" class="mobile-user-menu">
          <button class="user-menu-item" @click.stop="goToSettings">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </button>
          <button class="user-menu-item" @click.stop="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>

    <aside class="integrated-sidebar" :class="{
      'collapsed': sidebarCollapsed,
      'mobile-open': mobileMenuOpen
    }">
      <div class="sidebar-header">
        <div class="logo-section" :class="{ 'collapsed': sidebarCollapsed }">
          <router-link to="/" class="logo">
            <i class="fas fa-music logo-icon"></i>
            <span class="logo-text" v-show="!sidebarCollapsed">MyMusic</span>
          </router-link>
          <button class="collapse-btn d-none d-lg-block" @click="toggleSidebar"
            :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
            <i class="fas" :class="sidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'"></i>
          </button>
        </div>

        <!-- Search Section -->
        <div class="search-section" v-show="!sidebarCollapsed">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input type="text" placeholder="Search songs, artists, albums..." class="search-input" v-model="searchQuery"
              @keyup.enter="handleSearch">
            <button class="search-btn" @click="handleSearch" v-if="searchQuery">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
      <nav class="sidebar-navigation">
        <div class="nav-section">
          <h3 class="section-title" v-show="!sidebarCollapsed">Browse</h3>
          <ul class="nav-list">
            <li v-for="item in browseItems" :key="item.path">
              <router-link :to="item.path" class="nav-link" :class="{ 'active': isActive(item.path).value }"
                @click="closeMobileMenu" :title="sidebarCollapsed ? item.label : ''">
                <i :class="item.icon"></i>
                <span v-show="!sidebarCollapsed">{{ item.label }}</span>
                <div class="nav-indicator" v-if="isActive(item.path).value"></div>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- My Library Section -->
        <div class="nav-section">
          <h3 class="section-title" v-show="!sidebarCollapsed">My Library</h3>
          <ul class="nav-list">
            <li v-for="item in libraryItems" :key="item.path">
              <router-link :to="item.path" class="nav-link" :class="{ 'active': isActive(item.path).value }"
                @click="closeMobileMenu" :title="sidebarCollapsed ? item.label : ''">
                <i :class="item.icon"></i>
                <span v-show="!sidebarCollapsed">{{ item.label }}</span>
                <div class="nav-indicator" v-if="isActive(item.path).value"></div>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- User Section -->
      <div class="user-section">
        <div class="user-profile">
          <div class="user-info" :class="{ 'collapsed': sidebarCollapsed }" @click="toggleUserMenu">
            <div class="user-avatar-container">
              <img v-if="userId" :src="getAvatarUrl(user.avatar)" class="user-avatar" :alt="user.name">
              <i v-else class="fas fa-user" style="font-size: 1.5rem; color: #ff5ebc;"></i>
              <div class="online-status" v-if="userId && user.isOnline"></div>
            </div>
            <div v-if="userId" class="user-details" v-show="!sidebarCollapsed">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-status">Premium Member</div>
            </div>
          </div>
          <div v-if="userId && showUserMenu && !sidebarCollapsed" class="user-menu">
            <button class="user-menu-item" @click.stop="goToSettings">
              <i class="fas fa-cog"></i>
              <span>Settings</span>
            </button>
            <button class="user-menu-item" @click.stop="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div class="mobile-overlay d-lg-none" :class="{ 'active': mobileMenuOpen }" @click="closeMobileMenu"></div>

    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 94, 188, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1001;
}

.mobile-toggle {
  background: none;
  border: none;
  color: #ff5ebc;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: rgba(255, 94, 188, 0.1);
}

.mobile-logo {
  display: flex;
  align-items: center;
  color: #ff5ebc;
  font-weight: bold;
  font-size: 1.2rem;
  gap: 10px;
}

.mobile-user {
  position: relative;
}



.mobile-user-menu {
  position: absolute;
  top: 50px;
  right: 20px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 94, 188, 0.2);
  border-radius: 8px;
  padding: 8px;
  z-index: 1002;
  display: flex;
  flex-direction: column;
}

.integrated-sidebar {

  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  border-right: 1px solid rgba(255, 94, 188, 0.2);
  box-shadow: 8px 0 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
}

.integrated-sidebar.collapsed {
  width: 85px;
}

.sidebar-header {
  padding: 24px 24px;
  border-bottom: 1px solid rgba(255, 94, 188, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.logo-section.collapsed {
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #ff5ebc;
  font-weight: bold;
  font-size: 1.4rem;
  gap: 15px;
  transition: all 0.3s ease;
}

.logo:hover {
  color: #ff8fd4;
  text-shadow: 0 0 20px rgba(255, 94, 188, 0.5);
}

.logo-icon {
  font-size: 1.8rem;
}

.collapse-btn {
  background: rgba(255, 94, 188, 0.1);
  border: 1px solid rgba(255, 94, 188, 0.3);
  color: #ff5ebc;
  width: 40px;
  height: 30px;
  margin-left: 5px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(255, 94, 188, 0.2);
  transform: scale(1.05);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 94, 188, 0.2);
  border-radius: 14px;
  padding: 14px 18px;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ff5ebc;
  box-shadow: 0 0 20px rgba(255, 94, 188, 0.2);
}

.search-icon {
  color: #999;
  margin-right: 15px;
  transition: color 0.3s ease;
}

.search-container:focus-within .search-icon {
  color: #ff5ebc;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.95rem;
  outline: none;
}

.search-input::placeholder {
  color: #666;
}

.search-btn {
  background: #ff5ebc;
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: #ff8fd4;
  transform: scale(1.1);
}

.sidebar-navigation {
  flex: 1;
  padding: 24px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 36px;
  padding: 0 24px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 18px;
  padding-left: 6px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  color: #ccc;
  text-decoration: none;
  border-radius: 14px;
  margin-bottom: 6px;
  position: relative;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 94, 188, 0.1);
  color: #ff5ebc;
  transform: translateX(6px);
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(255, 94, 188, 0.2), rgba(255, 94, 188, 0.1));
  color: #ff5ebc;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(255, 94, 188, 0.3);
}

.nav-link i {
  width: 22px;
  margin-right: 18px;
  font-size: 1.1rem;
  text-align: center;
}

.nav-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #ff5ebc;
  border-radius: 2px;
}
.user-section {
  padding: 24px;

  border-top: 1px solid rgba(255, 94, 188, 0.1);
}


.user-info {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.user-info.collapsed {
  justify-content: center;
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid rgba(255, 94, 188, 0.5);
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #00ff88;
  border: 2px solid #1a1a2e;
  border-radius: 50%;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
}

.user-status {
  font-size: 0.8rem;
  color: #ff5ebc;
}

.user-menu {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  background: rgba(255, 94, 188, 0.1);
  border: 1px solid rgba(255, 94, 188, 0.2);
  border-radius: 8px;
  padding: 8px;
}

.user-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.user-menu-item:hover {
  background: rgba(255, 94, 188, 0.2);
  color: #ff5ebc;
}

.user-menu-item i {
  margin-right: 10px;
  width: 18px;
}

.main-content {
  margin-left: 340px;
  width: calc(100% - 340px);
  min-height: 100vh;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.integrated-sidebar.collapsed .nav-link {
  justify-content: center;
  border-radius: 8px;
}

.integrated-sidebar.collapsed .nav-link i {
  margin-right: 0;
  font-size: 1.2rem;
}

.main-content.sidebar-collapsed {
  margin-left: 85px;
  width: calc(100% - 85px);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Scrollbar */
.sidebar-navigation::-webkit-scrollbar {
  width: 5px;
}

.sidebar-navigation::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-navigation::-webkit-scrollbar-thumb {
  background: rgba(255, 94, 188, 0.3);
  border-radius: 4px;
}

.sidebar-navigation::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 94, 188, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .integrated-sidebar {
    transform: translateX(-100%);
  }

  .integrated-sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding-top: 84px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .main-content.sidebar-collapsed {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .integrated-sidebar {
    width: 100%;
  }

  .sidebar-header {
    padding: 20px;
  }

  .nav-section {
    padding: 0 20px;
  }

  .user-section {
    padding: 20px;
  }

  .main-content {
    padding: 20px 15px;
    padding-top: 80px;
  }
}
</style>
