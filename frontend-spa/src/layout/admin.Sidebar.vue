<template>
  <div class="admin-layout-container" id="admin-layout">
    <aside
      :class="['sidebar', { 'sidebar-open': sidebarOpen, 'sidebar-collapsed': !sidebarOpen }]"
      :aria-expanded="sidebarOpen"
      role="navigation"
      aria-label="Admin Navigation"
    >
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🎵</div>
          <transition name="fade">
            <h2 v-if="sidebarOpen" class="logo-text">Music Admin</h2>
          </transition>
        </div>
        <button
          class="hamburger-btn"
          @click="toggleSidebar"
          :aria-label="sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
        >
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
          <div class="hamburger-line"></div>
        </button>
      </div>

      <nav class="nav-menu">
        <ul>
          <li v-for="(item, index) in menuItems" :key="index" class="nav-item">
            <router-link
              :to="item.path"
              class="nav-link"
              :class="{ active: isActive(item.path) }"
              :title="item.name"
              @click="closeMobileMenu"
              :aria-current="isActive(item.path) ? 'page' : undefined"
            >
              <span class="nav-icon">{{ item.icon || '' }}</span>
              <transition name="fade">
                <span v-if="sidebarOpen" class="nav-text">{{ item.name }}</span>
              </transition>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="admin-profile-section">
        <div class="admin-profile" :class="{ 'collapsed': !sidebarOpen }">
          <div class="admin-avatar-container">
            <div class="admin-avatar">
              <div class="avatar-image">
                <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.name" />
                <span v-else class="avatar-initials">{{ getUserInitials(userInfo.name) }}</span>
              </div>
              <div class="online-indicator"></div>
            </div>
            <transition name="fade">
              <div v-if="sidebarOpen" class="admin-info">
                <div class="admin-name">{{ userInfo.name }}</div>
                <div class="admin-email">{{ userInfo.email }}</div>
                <div class="admin-role">{{ userInfo.role }}</div>
                <div class="admin-status">
                  <div class="status-dot"></div>
                  <span>Online</span>
                </div>
              </div>
            </transition>
          </div>
          <div class="admin-actions" :class="{ 'admin-actions-collapsed': !sidebarOpen }">
            <button
              class="admin-action-btn theme-toggle-btn"
              @click="toggleTheme"
              :title="isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
              v-if="sidebarOpen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="isDarkTheme" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                <path v-else d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.36-5.36l-1.41 1.41M7.05 16.95l-1.41 1.41m12.72 0l-1.41-1.41M8.36 5.36L6.95 6.77"/>
              </svg>
              <span>Toggle Theme</span>
            </button>
            <button
              class="admin-action-btn profile-btn"
              @click="openProfile"
              title="Profile Settings"
              v-if="sidebarOpen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Profile</span>
            </button>
            <button
              class="admin-action-btn logout-btn"
              @click="confirmLogout"
              title="Logout"
              :class="{ 'admin-action-btn-icon': !sidebarOpen }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <path d="M21 12H9"/>
              </svg>
              <span v-if="sidebarOpen">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div class="floating-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth.service';

export default {
  name: 'AdminSidebar',
  setup() {
    const sidebarOpen = ref(window.innerWidth > 768);
    const isDarkTheme = ref(true);
    const router = useRouter();

    const menuItems = [
      { name: 'Dashboard', path: '/admin', icon: '🏠' },
      { name: 'Songs', path: '/admin/songs', icon: '🎵' },
      { name: 'Artists', path: '/admin/artists', icon: '🎤' },
      { name: 'Albums', path: '/admin/albums', icon: '💿' },
      { name: 'Users', path: '/admin/users', icon: '👥' }
    ];

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
      console.log('Sidebar toggled:', sidebarOpen.value ? 'Open' : 'Collapsed');
    };

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
      document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');
      console.log('Theme toggled:', isDarkTheme.value ? 'Dark' : 'Light');
    };

    const isActive = (path) => {
      if (path === '/admin') return router.currentRoute.value.path === '/admin';
      return router.currentRoute.value.path.startsWith(path);
    };

    const userInfo = computed(() => {
      const user = authService.getUser() || {};
      return {
        name: user.name || user.full_name || 'Admin User',
        email: user.email || 'admin@musicapp.com',
        role: user.role || 'Administrator',
        avatar: user.avatar || null
      };
    });

    const getUserInitials = (name) => {
      if (!name) return 'AU';
      return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
    };

    const openProfile = () => {
      console.log('Opening admin profile settings...', userInfo.value);
      alert(`Profile settings for ${userInfo.value.name}\nEmail: ${userInfo.value.email}\nRole: ${userInfo.value.role}\nComing soon!`);
    };

    const confirmLogout = () => {
      const message = `Are you sure you want to logout?\nUser: ${userInfo.value.name}\nEmail: ${userInfo.value.email}`;
      if (confirm(message)) handleLogout();
    };

    const handleLogout = () => {
      console.log('Logout requested for user:', userInfo.value.name);
      authService.logout();
      router.push('/login');
    };

    const closeMobileMenu = () => {
      if (window.innerWidth <= 768) {
        sidebarOpen.value = false;
      }
    };

    onMounted(() => {
      console.log('AdminSidebar mounted, isAuthenticated:', authService.checkAuth());
      console.log('Initial user info:', userInfo.value);

      // Handle window resize for responsive sidebar
      const handleResize = () => {
        sidebarOpen.value = window.innerWidth > 768;
      };

      window.addEventListener('resize', handleResize);

      // Set initial theme
      document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light');

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return {
      sidebarOpen,
      isDarkTheme,
      menuItems,
      toggleSidebar,
      toggleTheme,
      isActive,
      userInfo,
      getUserInitials,
      openProfile,
      confirmLogout,
      handleLogout,
      closeMobileMenu
    };
  }
};
</script>

<style scoped>
:root {
  --primary-color: #8a2be2;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --secondary-text: #cccccc;
  --border-color: rgba(255, 255, 255, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.1);
  --active-bg: rgba(138, 43, 226, 0.5);
}

[data-theme="light"] {
  --primary-color: #6a0dad;
  --background-color: #f5f5f5;
  --text-color: #333333;
  --secondary-text: #666666;
  --border-color: rgba(0, 0, 0, 0.1);
  --hover-bg: rgba(0, 0, 0, 0.05);
  --active-bg: rgba(106, 13, 173, 0.2);
}

.sidebar {
  width: 280px;
  background: var(--background-color);
  color: var(--text-color);
  transition: width 0.3s ease, transform 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
  width: 80px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar-open {
    transform: translateX(0);
    width: 280px;
  }
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.hamburger-btn {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hamburger-line {
  width: 1.5rem;
  height: 2px;
  background: var(--text-color);
  transition: all 0.3s ease;
}

.nav-menu {
  padding: 1rem;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
}

.nav-item {
  margin: 0.5rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background: var(--hover-bg);
}

.nav-link.active {
  background: var(--active-bg);
  font-weight: 500;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.nav-text {
  flex: 1;
}

.admin-profile-section {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.admin-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-avatar-container {
  display: flex;
  align-items: center;
}

.admin-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 1rem;
  color: var(--text-color);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.625rem;
  height: 0.625rem;
  background: #00ff00;
  border-radius: 50%;
  border: 2px solid var(--background-color);
}

.admin-info {
  margin-left: 1rem;
  flex: 1;
}

.admin-name {
  font-size: 1rem;
  font-weight: 600;
}

.admin-email {
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.admin-role {
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.admin-status {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  background: #00ff00;
  border-radius: 50%;
  margin-right: 0.375rem;
}

.admin-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.admin-actions-collapsed {
  display: flex;
  justify-content: center;
}

.admin-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.admin-action-btn:hover {
  background: var(--hover-bg);
}

.admin-action-btn-icon {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.admin-action-btn-icon:hover {
  background: var(--hover-bg);
}

.floating-orbs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.3;
  animation: float 15s infinite;
}

.orb-1 { width: 3rem; height: 3rem; top: 10%; left: 20%; }
.orb-2 { width: 4rem; height: 4rem; top: 50%; left: 70%; }
.orb-3 { width: 2.5rem; height: 2.5rem; top: 80%; left: 30%; }

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-1.5rem); }
  100% { transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .admin-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-action-btn {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
