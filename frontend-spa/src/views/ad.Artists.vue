<template>
  <EntityTable
    v-bind="tableConfig"
    :rows="artists"
    @add="openAddArtist"
    @edit="openEditArtist"
    @delete="deleteArtist"
    @view="viewArtist"
  />

  <ArtistModal
    :show="showModal"
    :artist="selectedArtist || {}"
    :mode="modalMode"
    @save="handleArtistSave"
    @cancel="closeModal"
    @success="onArtistSuccess"
    @error="onArtistError"
  />
</template>

<script>
import EntityTable from '@/layout/EntityTable.vue'
import ArtistModal from '@/components/admin/ArtistModal.vue'
import artistService from '@/services/artist.service'

export default {
  name: 'Artists',
  components: {
    EntityTable,
    ArtistModal
  },
  data() {
    return {
      artists: [],
      showModal: false,
      selectedArtist: null,
      modalMode: 'add',
      isProcessing: false,
      tableConfig: {
        tableTitle: 'Artists Hub',
        entityName: 'artists',
        searchPlaceholder: 'Search artists by name...',
        addButtonText: 'Add Artist',
        emptyMessage: 'No artists found. Create your first artist to get started.',
        itemsPerPage: 15,
        searchableColumns: ['name'],
        columns: [
          {
            key: 'avatar_url',
            label: 'Avatar',
            type: 'avatar',
            sortable: false,
            maxLength: 0
          },
          {
            key: 'artist_id',
            label: 'ID',
            type: 'text',
            sortable: true,
            maxLength: 10
          },
          {
            key: 'name',
            label: 'Artist Name',
            type: 'text',
            sortable: true,
            maxLength: 35
          },
          {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            sortable: false,
            maxLength: 0
          }
        ]
      }
    }
  },
  methods: {
    async fetchArtists() {
      try {
        console.log('Starting fetchArtists, artistService:', artistService)
        const response = await artistService.getAllArtists()
        console.log('API Response from getAllArtists:', response)

        let artistsData = []
        if (response && response.status === 'success' && response.data) {
          if (Array.isArray(response.data)) {
            artistsData = response.data
          } else if (response.data.artists) {
            artistsData = response.data.artists
          } else if (response.data.data) {
            artistsData = response.data.data
          }
        } else if (Array.isArray(response)) {
          artistsData = response
        }

        this.artists = artistsData.map(artist => ({
          artist_id: artist.artist_id || artist.id,
          name: artist.name || 'Unknown Artist',
          bio: artist.bio || '',
          avatar_url: artist.avatar_url ? `/public/uploads/images${artist.avatar_url}` : null
        }))

        console.log('Mapped artists:', this.artists)
      } catch (error) {
        console.error('FetchArtists error:', error)
        this.artists = []
        this.showNotification('Failed to load artists', 'error')
      }
    },

    openAddArtist() {
      this.selectedArtist = {}
      this.modalMode = 'add'
      this.showModal = true
    },

    openEditArtist(artist) {
      this.selectedArtist = artist ? { ...artist } : {}
      this.modalMode = 'edit'
      this.showModal = true
    },

    viewArtist(artist) {
      if (!artist) return

      const details = [
        `ID: ${artist.artist_id || 'N/A'}`,
        `Name: ${artist.name || 'N/A'}`,
        `Bio: ${artist.bio || 'No biography available'}`,
        `Avatar: ${artist.avatar_url ? 'Yes' : 'No'}`
      ].join('\n')

      alert(`Artist Details:\n${details}`)
    },

    async deleteArtist(artist) {
      if (!artist || !artist.artist_id) {
        this.showNotification('Invalid artist data', 'error')
        return
      }

      if (!confirm(`Are you sure you want to delete artist "${artist.name}"?`)) {
        return
      }

      try {
        await artistService.deleteArtist(artist.artist_id)

        // Remove from local array for immediate UI update
        this.artists = this.artists.filter(a => a.artist_id !== artist.artist_id)

        this.showNotification(`Artist "${artist.name}" has been deleted successfully.`, 'success')

        // Refresh the list to ensure consistency
        await this.fetchArtists()
      } catch (error) {
        console.error('Delete artist error:', error)
        this.showNotification(`Failed to delete artist: ${error.message}`, 'error')

        // Refresh the list in case of error
        await this.fetchArtists()
      }
    },

    async handleArtistSave(formData, callbacks) {
      if (this.isProcessing) {
        console.log('Save operation already in progress')
        callbacks?.onError(new Error('Save operation already in progress'))
        return
      }

      this.isProcessing = true

      try {
        console.log('Processing artist save:', {
          mode: this.modalMode,
          formData: this.debugFormData(formData)
        })

        let response
        if (this.modalMode === 'edit') {
          // Extract artist ID from formData for update
          const artistId = formData.get('artist_id')
          if (!artistId) {
            throw new Error('Artist ID is required for update operation')
          }

          console.log('Updating artist with ID:', artistId)
          response = await artistService.updateArtist(artistId, formData)
        } else {
          console.log('Creating new artist')
          response = await artistService.createArtist(formData)
        }

        console.log('Save response:', response)

        // Check if response indicates success
        if (response && (response.status === 'success' || response.success)) {
          callbacks?.onSuccess()
        } else {
          const errorMessage = this.extractErrorMessage(response)
          throw new Error(errorMessage)
        }

      } catch (error) {
        console.error('Artist save error:', error)

        // Extract meaningful error message
        const friendlyError = this.createFriendlyError(error)
        callbacks?.onError(friendlyError)
      } finally {
        this.isProcessing = false
      }
    },

    debugFormData(formData) {
      const entries = []
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          entries.push([key, `File: ${value.name} (${value.size} bytes)`])
        } else {
          entries.push([key, value])
        }
      }
      return entries
    },

    extractErrorMessage(response) {
      if (response?.message) return response.message
      if (response?.error) return response.error
      if (response?.data?.message) return response.data.message
      return 'Save operation failed'
    },

    createFriendlyError(error) {
      // Parse the error message to extract useful info
      const errorStr = error.message || error.toString()

      if (errorStr.includes('HTTP error! status: 500')) {
        // Try to extract the actual error from the body
        const bodyMatch = errorStr.match(/body: ({.*})/)
        if (bodyMatch) {
          try {
            const errorBody = JSON.parse(bodyMatch[1])
            if (errorBody.message && errorBody.message !== 'Internal server error') {
              return new Error(`Server error: ${errorBody.message}`)
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
        return new Error('Server error occurred. Please check your data and try again.')
      }

      if (errorStr.includes('HTTP error! status: 400')) {
        return new Error('Invalid data submitted. Please check your input.')
      }

      if (errorStr.includes('HTTP error! status: 401')) {
        return new Error('Authentication required. Please log in again.')
      }

      if (errorStr.includes('HTTP error! status: 403')) {
        return new Error('You do not have permission to perform this action.')
      }

      if (errorStr.includes('timeout')) {
        return new Error('Request timed out. Please try again.')
      }

      if (errorStr.includes('Network')) {
        return new Error('Network error. Please check your connection.')
      }

      // Return the original error if we can't make it friendlier
      return error
    },

    async onArtistSuccess() {
      console.log('Artist saved successfully')

      // Refresh the artists list
      await this.fetchArtists()

      // Show success notification
      const action = this.modalMode === 'edit' ? 'updated' : 'created'
      this.showNotification(`Artist has been ${action} successfully!`, 'success')

      // Close modal will be handled automatically by the modal component
    },

    onArtistError(error) {
      console.error('Artist save error from modal:', error)

      // Only show notification if not already handled
      if (error && error.message) {
        this.showNotification(`${error.message}`, 'error')
      } else {
        this.showNotification('An unknown error occurred while saving', 'error')
      }
    },

    closeModal() {
      this.showModal = false
      this.selectedArtist = null
      this.modalMode = 'add'
      this.isProcessing = false
    },

    showNotification(message, type = 'info') {

      if (type === 'error') {
        alert(`❌ ${message}`)
      } else if (type === 'success') {
        alert(`✅ ${message}`)
      } else {
        alert(`ℹ️ ${message}`)
      }


      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  },

  async mounted() {
    console.log('Artists component mounted')
    console.log('Calling fetchArtists...')

    try {
      await this.fetchArtists()
    } catch (error) {
      console.error('Error during initial fetch:', error)
      this.showNotification('Failed to load initial data', 'error')
    }
  }
}
</script>

