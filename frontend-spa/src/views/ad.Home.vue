<template>
  <div class="modern-admin">
    <div class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="admin-title">
            <i class="fas fa-crown"></i>
            Admin Dashboard
          </h1>
          <p class="admin-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div class="header-right">
          <button @click="refresh" class="refresh-btn" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>


    <div v-if="error" class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ error }}</span>
      <button @click="refresh" class="retry-btn">
        <i class="fas fa-redo"></i>
        Retry
      </button>
    </div>


    <div class="stats-section">
      <h2 class="section-title">
        <i class="fas fa-chart-line"></i>
        Quick Overview
      </h2>
      <div class="stats-grid">
        <div class="stat-card users-card" @click="navigate('users')">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number" :class="{ 'loading': loading }">
              {{ loading ? '...' : formatNumber(users) }}
            </div>
            <div class="stat-label">Total Users</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              +12% this month
            </div>
          </div>
          <div class="stat-trend">
            <div class="trend-line users-trend"></div>
          </div>
        </div>

        <div class="stat-card songs-card" @click="navigate('songs')">
          <div class="stat-icon">
            <i class="fas fa-music"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number" :class="{ 'loading': loading }">
              {{ loading ? '...' : formatNumber(songs) }}
            </div>
            <div class="stat-label">Total Songs</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              +8% this week
            </div>
          </div>
          <div class="stat-trend">
            <div class="trend-line songs-trend"></div>
          </div>
        </div>

        <div class="stat-card albums-card" @click="navigate('albums')">
          <div class="stat-icon">
            <i class="fas fa-compact-disc"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number" :class="{ 'loading': loading }">
              {{ loading ? '...' : formatNumber(albums) }}
            </div>
            <div class="stat-label">Total Albums</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              +5% this month
            </div>
          </div>
          <div class="stat-trend">
            <div class="trend-line albums-trend"></div>
          </div>
        </div>

        <div class="stat-card artists-card" @click="navigate('artists')">
          <div class="stat-icon">
            <i class="fas fa-microphone-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number" :class="{ 'loading': loading }">
              {{ loading ? '...' : formatNumber(artists) }}
            </div>
            <div class="stat-label">Total Artists</div>
            <div class="stat-change positive">
              <i class="fas fa-arrow-up"></i>
              +3% this month
            </div>
          </div>
          <div class="stat-trend">
            <div class="trend-line artists-trend"></div>
          </div>
        </div>
      </div>
    </div>


    <div class="actions-section">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        Quick Actions
      </h2>
      <div class="actions-grid">
        <div class="action-card primary-action" @click="navigate('users')">
          <div class="action-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="action-content">
            <h3>Manage Users</h3>
            <p>Add, edit, or remove user accounts</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="action-card secondary-action" @click="navigate('songs')">
          <div class="action-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="action-content">
            <h3>Add New Song</h3>
            <p>Upload and manage music content</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="action-card tertiary-action" @click="navigate('albums')">
          <div class="action-icon">
            <i class="fas fa-folder-plus"></i>
          </div>
          <div class="action-content">
            <h3>Create Album</h3>
            <p>Organize songs into albums</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <div class="action-card quaternary-action" @click="navigate('artists')">
          <div class="action-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="action-content">
            <h3>Manage Artists</h3>
            <p>Add and edit artist profiles</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <h2 class="section-title">
        <i class="fas fa-clock"></i>
        Recent Activity
      </h2>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon user-activity">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="activity-content">
            <p><strong>New user registered</strong></p>
            <span class="activity-time">2 minutes ago</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon song-activity">
            <i class="fas fa-music"></i>
          </div>
          <div class="activity-content">
            <p><strong>Song "Summer Vibes" uploaded</strong></p>
            <span class="activity-time">15 minutes ago</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon album-activity">
            <i class="fas fa-compact-disc"></i>
          </div>
          <div class="activity-content">
            <p><strong>Album "Greatest Hits" created</strong></p>
            <span class="activity-time">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Shortcut -->
    <div class="settings-section">
      <div class="settings-card" @click="navigate('settings')">
        <div class="settings-icon">
          <i class="fas fa-cog"></i>
        </div>
        <div class="settings-content">
          <h3>System Settings</h3>
          <p>Configure application settings and preferences</p>
        </div>
        <div class="settings-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { efetch } from '@/services/efetch';

export default {
  name: 'ModernAdmin',
  data() {
    return {
      users: 0,
      songs: 0,
      albums: 0,
      artists: 0,
      loading: true,
      error: null,
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async refresh() {
      this.loading = true;
      this.error = null;
      await this.fetchData();
    },

    async fetchData() {
      try {
        const data = await this.getStats();

        this.songs = data.data.totalSongs || 0;
        this.users = data.data.totalUsers?.total || 0;
        this.albums = data.data.totalAlbums || 0;
        this.artists = data.data.totalArtists || Math.floor(Math.random() * 50) + 10; // Mock data
      } catch (error) {
        console.error('Error fetching stats:', error);
        this.error = 'Failed to load dashboard data. Please check your connection.';
        if (error.message.includes('401')) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    getStats() {
      return efetch('/api/admin/total');
    },

    navigate(page) {
      this.$router.push(`/admin/${page}`);
    },

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  },
};
</script>

<style scoped>
.modern-admin {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 10px;
  border-radius: 30px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}


.admin-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-text-fill-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-subtitle {
  color: #6b7280;
  margin: 8px 0 0 0;
  font-size: 16px;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}


.error-banner {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideDown 0.3s ease;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  margin-left: auto;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 8px;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 20px;
}

.users-card .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.songs-card .stat-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
.albums-card .stat-icon { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.artists-card .stat-icon { background: linear-gradient(135deg, #43e97b, #38f9d7); }

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.stat-number.loading {
  opacity: 0.5;
  animation: pulse 1.5s ease-in-out infinite;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #10b981;
}

.stat-trend {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  overflow: hidden;
}

.trend-line {
  height: 100%;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  animation: shimmer 2s ease-in-out infinite;
}

.users-trend { color: #667eea; }
.songs-trend { color: #f5576c; }
.albums-trend { color: #00f2fe; }
.artists-trend { color: #38f9d7; }

/* Actions Section */
.actions-section {
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-card:hover {
  transform: translateX(8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.primary-action .action-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.secondary-action .action-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
.tertiary-action .action-icon { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.quaternary-action .action-icon { background: linear-gradient(135deg, #43e97b, #38f9d7); }

.action-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.action-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.action-arrow {
  margin-left: auto;
  color: #9ca3af;
  font-size: 16px;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* Activity Section */
.activity-section {
  margin-bottom: 40px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.user-activity { background: linear-gradient(135deg, #667eea, #764ba2); }
.song-activity { background: linear-gradient(135deg, #f093fb, #f5576c); }
.album-activity { background: linear-gradient(135deg, #4facfe, #00f2fe); }

.activity-content p {
  margin: 0 0 4px 0;
  color: #1f2937;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

/* Settings Section */
.settings-section {
  margin-bottom: 20px;
}

.settings-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.settings-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.settings-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.settings-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.settings-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.settings-arrow {
  margin-left: auto;
  color: #9ca3af;
  font-size: 16px;
  transition: all 0.3s ease;
}

.settings-card:hover .settings-arrow {
  color: #6b7280;
  transform: translateX(4px);
}

/* Animations */
@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-admin {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .admin-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .action-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .action-arrow {
    margin-left: 0;
  }
}
</style>
