<template>
  <div class="table-container">
    <div class="table-header-section">
      <div class="header-left-section">
        <h3 class="table-title-text">
          <span class="title-icon-text">{{ tableIcon }}</span>
          {{ tableTitle }}
          <span class="item-count-text">({{ filteredRows.length }} items)</span>
        </h3>
      </div>

      <div class="header-right-section">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input-field"
          />
        </div>

        <button @click="$emit('add')" class="add-button">
          ➕ {{ addButtonText }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-scroll-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" @click="col.sortable ? toggleSort(col.key) : null">
              <div class="header-cell">
                <span>{{ col.label }}</span>
                <span v-if="sortBy === col.key && col.sortable" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedRows" :key="getRowKey(row, index)" class="data-row">
            <td v-for="col in columns" :key="col.key">

              <div v-if="col.type === 'avatar'" class="avatar-container">
                <img v-if="row[col.key]" :src="getImgCover(row[col.key])" :alt="row.name" class="avatar-image"/>
                <div v-else class="avatar-placeholder-circle">
                  {{ getInitials(row.name || row.username || row.title) }}
                </div>
              </div>

              <span v-else-if="col.type === 'badge'" :class="getBadgeClasses(row[col.key])">
                {{ row[col.key] }}
              </span>

              <span v-else-if="col.type === 'date'" class="date-text">
                {{ formatDate(row[col.key]) }}
              </span>

              <span v-else-if="col.type === 'duration'" class="duration-text">
                {{ formatDuration(row[col.key]) }}
              </span>

              <span v-else-if="col.type === 'file-size'" class="file-size-text">
                {{ formatFileSize(row[col.key]) }}
              </span>

              <span v-else-if="col.type === 'boolean'" :class="getBooleanClasses(row[col.key])">
                {{ row[col.key] ? 'Yes' : 'No' }}
              </span>

              <div v-else-if="col.type === 'actions'" class="inline-actions">
                <button
                  @click="$emit('view', row)"
                  class="action-btn view-btn"
                  title="View Details"
                >
                  👁️
                </button>

                <button
                  @click="$emit('edit', row)"
                  class="action-btn edit-btn"
                  title="Edit"
                >
                  ✏️
                </button>

                <button
                  @click="confirmDelete(row)"
                  class="action-btn delete-btn"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              <span v-else class="cell-text" :title="row[col.key]">
                {{ truncateText(row[col.key], col.maxLength || 50) }}
              </span>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredRows.length === 0" class="empty-row">
            <td :colspan="columns.length" class="empty-cell">
              <div class="empty-state-container">
                <h4>No {{ entityName }} Found</h4>
                <p>{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="pagination-info">
        Showing {{ startItem }} to {{ endItem }} of {{ filteredRows.length }} entries
      </div>

      <div class="pagination-controls">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          ⏮️
        </button>

        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          ⬅️
        </button>

        <div class="page-numbers-container">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="getPageButtonClasses(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          ➡️
        </button>

        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          ⏭️
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntityTable',
  props: {
    columns: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
    tableTitle: { type: String, default: 'Data Table' },
    tableIcon: { type: String, default: '📋' },
    entityName: { type: String, default: 'items' },
    searchPlaceholder: { type: String, default: 'Search...' },
    addButtonText: { type: String, default: 'Add New' },
    emptyMessage: { type: String, default: 'Try adjusting your search or add new items' },
    showPlayButton: { type: Boolean, default: false },
    itemsPerPage: { type: Number, default: 10 },
    searchableColumns: { type: Array, default: () => [] }
  },
  emits: ['add', 'edit', 'delete', 'view', 'play'],
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      sortBy: null,
      sortOrder: 'asc'
    }
  },
  computed: {
    filteredRows() {
      if (!this.searchQuery.trim()) return this.sortedRows

      const query = this.searchQuery.toLowerCase()
      const searchCols = this.searchableColumns.length > 0
        ? this.searchableColumns
        : this.columns.filter(col => col.type !== 'actions').map(col => col.key)

      return this.sortedRows.filter(row => {
        return searchCols.some(key => {
          const value = row[key]
          return value && String(value).toLowerCase().includes(query)
        })
      })
    },

    sortedRows() {
      if (!this.sortBy) return [...this.rows]

      return [...this.rows].sort((a, b) => {
        let aVal = a[this.sortBy]
        let bVal = b[this.sortBy]

        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''

        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()

        let result = aVal.localeCompare(bVal)
        return this.sortOrder === 'desc' ? -result : result
      })
    },

    totalPages() {
      return Math.ceil(this.filteredRows.length / this.itemsPerPage)
    },

    paginatedRows() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredRows.slice(start, end)
    },

    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },

    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredRows.length)
    },

    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    rows() {
      this.currentPage = 1
    }
  },
  methods: {
    getRowKey(row, index) {
      return row.artist_id || row.song_id || row.user_id || row.id || row.album_id || index
    },

    toggleSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = column
        this.sortOrder = 'asc'
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    confirmDelete(row) {
      const name = row.username || row.name || row.title || row.email || 'this item'
      if (confirm(`Are you sure you want to delete "${name}"?`)) {
        this.$emit('delete', row)
      }
    },

    getInitials(name) {
      if (!name) return '?'
      return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },

    getBadgeClasses(value) {
      const baseClass = 'badge-cell'
      const lowerValue = String(value).toLowerCase()

      if (['admin', 'active', 'published', 'public'].includes(lowerValue)) {
        return `${baseClass} badge-success`
      }
      if (['inactive', 'private', 'draft'].includes(lowerValue)) {
        return `${baseClass} badge-warning`
      }
      if (['banned', 'deleted'].includes(lowerValue)) {
        return `${baseClass} badge-danger`
      }
      return `${baseClass} badge-default`
    },

    getBooleanClasses(value) {
      return value ? 'boolean-cell boolean-active' : 'boolean-cell boolean-inactive'
    },

    getPageButtonClasses(page) {
      return page === this.currentPage ? 'page-button page-button-active' : 'page-button'
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        return new Date(dateString).toLocaleDateString()
      } catch {
        return dateString
      }
    },

    formatDuration(seconds) {
      if (!seconds) return '-'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    formatFileSize(bytes) {
      if (!bytes) return '-'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    truncateText(text, maxLength) {
      if (!text) return '-'
      const str = String(text)
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
    },

    getImgCover(path) {
    if (!path) return '/default-artists.jpg';
    const cleanedPath = path.replace(/^public\/|\/public\/uploads\/images\//g, '').replace(/\/+/g, '/');
    const filename = cleanedPath.split('/').pop() || 'default-artists.jpg';
    return `/uploads/img/${filename}`;
  },
  }
}
</script>

<style scoped>

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  margin: 0;
  width: 100%;
}

.table-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left-section {
  flex: 1;
}

.table-title-text {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon-text {
  font-size: 1.5rem;
}

.item-count-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
}

.header-right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
}

.search-input-field {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 250px;
  outline: none;
}

.search-input-field:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.add-button {
  padding: 0.5rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.add-button:hover {
  background: #7c3aed;
}

.table-scroll-wrapper {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  cursor: pointer;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th:hover {
  background: #f1f5f9;
}

.header-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sort-indicator {
  color: #8b5cf6;
  font-weight: bold;
}

.data-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.data-row:hover {
  background: #fafbfc;
}

.data-table td {
  padding: 1rem;
  vertical-align: middle;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.avatar-image {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.avatar-placeholder-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-cell {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #dc2626;
}

.badge-default {
  background: #f1f5f9;
  color: #475569;
}

.boolean-cell {
  font-weight: 600;
  font-size: 0.75rem;
}

.boolean-active {
  color: #059669;
}

.boolean-inactive {
  color: #dc2626;
}

.date-text,
.duration-text,
.file-size-text {
  color: #6b7280;
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
}

.cell-text {
  color: #374151;
}

.inline-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.view-btn:hover {
  background: #dbeafe;
  border-color: #3b82f6;
}

.edit-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.empty-row {
  background: #fafbfc;
}

.empty-cell {
  padding: 3rem;
  text-align: center;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state-container h4 {
  margin: 0;
  font-size: 1.125rem;
  color: #374151;
}

.empty-state-container p {
  margin: 0;
  font-size: 0.875rem;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #fafbfc;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers-container {
  display: flex;
  gap: 0.25rem;
}

.page-button {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.page-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.page-button-active {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
}

@media (max-width: 768px) {
  .table-header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-right-section {
    justify-content: space-between;
  }

  .search-input-field {
    width: 100%;
    max-width: 200px;
  }

  .inline-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    width: 100%;
    min-height: 28px;
  }

  .pagination-container {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .data-table th,
  .data-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.8125rem;
  }

  .table-title-text {
    font-size: 1.125rem;
  }

  .title-icon-text {
    font-size: 1.25rem;
  }

  .inline-actions {
    flex-direction: row;
    gap: 0.25rem;
  }

  .action-btn {
    font-size: 0.875rem;
    min-width: 28px;
    height: 28px;
    padding: 0.125rem 0.25rem;
  }
}
</style>
