<template>
  <template v-if="isAuthenticated">
    <Sidebar :current-user="currentUser" @logout="handleLogout" />

    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <div class="page-title-container">
            <h1 class="page-title">{{ currentPageTitle }}</h1>
            <div class="title-underline"></div>
          </div>
        </div>
        <div class="header-right">
          <div class="search-container">
            <div class="search-box">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search anything..."
                @input="handleSearch"
              />
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button
              v-if="showRefreshButton"
              @click="handleRefresh"
              class="btn btn-primary"
              :disabled="isRefreshing"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :class="{ 'animate-spin': isRefreshing }"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              {{ isRefreshing ? 'Refreshing...' : refreshButtonText }}
            </button>

            <button class="action-btn notification-btn">
              <div class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div class="notification-badge">{{ notificationCount }}</div>
            </button>

            <button class="action-btn settings-btn" @click="openSettings">
              <div class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="M9 9l-2-2 2-2"/>
                  <path d="M15 9l2-2-2-2"/>
                </svg>
              </div>
            </button>

            <slot name="header-actions" />
          </div>
        </div>
      </header>

      <div class="content-area">
        <slot />
      </div>
    </div>

    <div class="floating-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </template>

  <template v-else>
    <div class="auth-redirect">
      <div class="redirect-content">
        <h2>Authentication Required</h2>
        <p>Please login to access this page</p>
        <button @click="redirectToLogin" class="btn btn-primary">
          Go to Login
        </button>
      </div>
    </div>
  </template>
</template>

<script>
import Sidebar from '@/layout/admin.Sidebar.vue'
import { authService } from '@/services/auth.service'

export default {
  name: 'LayoutWrapper',
  components: {
    Sidebar
  },
  props: {
    pageTitle: {
      type: String,
      default: 'Admin Panel'
    },
    showRefreshButton: {
      type: Boolean,
      default: true
    },
    refreshButtonText: {
      type: String,
      default: 'Refresh Data'
    }
  },
  emits: ['refresh', 'search'],
  data() {
    return {
      searchQuery: '',
      notificationCount: 3,
      isRefreshing: false,
      currentUser: null
    }
  },
  computed: {
    isAuthenticated() {
      return authService.checkAuth()
    },
    currentPageTitle() {
      const routeTitles = {
        '/': 'Dashboard',
        '/users': 'User Management',
        '/albums': 'Album Collection',
        '/artists': 'Artists Hub',
        '/songs': 'Songs Library',
      }

      return routeTitles[this.$route?.path] || this.pageTitle
    }
  },
  watch: {
    isAuthenticated: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadCurrentUser()
        } else {
          this.currentUser = null
        }
      }
    }
  },
  mounted() {
  console.log('LayoutWrapper mounted, isAuthenticated:', this.isAuthenticated)
  if (this.isAuthenticated) {
    this.loadCurrentUser()
    console.log('Current user after load:', this.currentUser)
  }
},
  methods: {
    loadCurrentUser() {
      try {
        this.currentUser = authService.getUser()
        console.log('Current user loaded:', this.currentUser)

        if (!this.currentUser) {
          this.currentUser = {
            name: 'Admin User',
            email: 'admin@musicapp.com',
            role: 'Administrator',
            avatar: null
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        this.currentUser = {
          name: 'Admin User',
          email: 'admin@musicapp.com',
          role: 'Administrator',
          avatar: null
        }
      }
    },

    handleSearch() {
      console.log('Global search:', this.searchQuery)
      this.$emit('search', this.searchQuery)
      this.$root.$emit('global-search', this.searchQuery)
    },

    async handleRefresh() {
      if (this.isRefreshing) return

      this.isRefreshing = true

      try {
        this.$emit('refresh')
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Page refreshed successfully')
      } catch (error) {
        console.error('Error refreshing page:', error)
      } finally {
        this.isRefreshing = false
      }
    },

    openSettings() {
      console.log('Opening settings...')
      alert('Settings panel coming soon!')
    },

    async handleLogout() {
      try {
        console.log('Logging out...')

        if (!confirm('Are you sure you want to logout?')) {
          return
        }

        authService.logout()
        this.currentUser = null

        console.log('Successfully logged out')

        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        alert('Error during logout. Please try again.')
      }
    },

    redirectToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>
