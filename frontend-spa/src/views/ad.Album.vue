<template>

    <EntityTable v-bind="tableConfig" :rows="albums" @add="openAddAlbum" @edit="openEditAlbum" @delete="deleteAlbum"
      @view="viewAlbum" />

    <AlbumModal :show="showModal" :album="selectedAlbum || {}" :mode="modalMode" @saved="onAlbumSaved"
      @cancel="closeModal" />

</template>

<script>

import EntityTable from '@/layout/EntityTable.vue'
import AlbumModal from '@/components/admin/AlbumModal.vue'
import albumService from '@/services/album.service'

export default {
  name: 'Albums',
  components: {
    EntityTable,
    AlbumModal
  },
  data() {
    return {
      albums: [],
      showModal: false,
      selectedAlbum: null,
      modalMode: 'add',
      tableConfig: {
        tableTitle: 'Album Collection',
        entityName: 'albums',
        searchPlaceholder: 'Search albums by title...',
        addButtonText: 'Add Album',
        emptyMessage: 'No albums found. Create your first album to get started.',
        itemsPerPage: 15,
        searchableColumns: ['title', 'artist_name'],
        columns: [
          {
            key: 'cover_url',
            label: 'Cover',
            type: 'avatar',
            sortable: false,
            maxLength: 0
          },
          {
            key: 'album_id',
            label: 'ID',
            type: 'text',
            sortable: true,
            maxLength: 10
          },
          {
            key: 'title',
            label: 'Album Title',
            type: 'text',
            sortable: true,
            maxLength: 35
          },
          {
            key: 'artist_name',
            label: 'Artist',
            type: 'text',
            sortable: true,
            maxLength: 20
          },
          {
            key: 'release_date',
            label: 'Release Date',
            type: 'date',
            sortable: true,
            maxLength: 0
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
    async fetchAlbums() {
      try {
        const response = await albumService.getAllAlbums();
        let albumsData = [];

        if (response?.status === 'success' && response.data) {
          albumsData = Array.isArray(response.data) ? response.data : response.data.albums || [];
        } else if (Array.isArray(response)) {
          albumsData = response;
        }

        this.albums = albumsData.map(album => ({
          album_id: album.album_id || album.id,
          title: album.title || 'Unknown Album',
          artist_id: album.artist_id,
          artist_name: album.artist_name || album.artist || 'Unknown Artist',
          cover_url: album.cover_url ? `/public/uploads/images${album.cover_url}` : null,
          release_date: album.release_date,
          song_count: album.song_count || 0
        }));
      } catch (error) {
        console.error('Error fetching albums:', error);
        alert(`Failed to load albums: ${error.message}`);
        this.albums = [];
      }
    },
    async onAlbumSaved(result) {
      this.closeModal();
      const action = this.modalMode === 'edit' ? 'updated' : 'added';
      alert(`Album has been ${action} successfully. ${result?.data?.song_count ? `${result.data.song_count} song(s) added.` : ''}`);
      await this.fetchAlbums();
    },

    openAddAlbum() {
      console.log('Opening add album modal')
      this.selectedAlbum = {}
      this.modalMode = 'add'
      this.showModal = true
    },

    openEditAlbum(album) {
      console.log('Opening edit album modal for:', album.title)
      this.selectedAlbum = album ? { ...album } : {}
      this.modalMode = 'edit'
      this.showModal = true
    },

    viewAlbum(album) {
      if (!album) return

      console.log('Viewing album details:', album.title)

      const releaseDate = album.release_date
        ? new Date(album.release_date).toLocaleDateString()
        : 'Unknown'

      const details = `Album Details:

      ID: ${album.album_id || 'N/A'}
      Title: ${album.title || 'N/A'}
      Artist: ${album.artist_name || 'N/A'}
      Artist ID: ${album.artist_id || 'N/A'}
      Release Date: ${releaseDate}
      Songs Count: ${album.song_count || 0}
      Cover: ${album.cover_url ? 'Yes' : 'No'}`

      alert(details)
    },

    async deleteAlbum(album) {
      if (!album || !album.album_id) {
        console.error('Invalid album object for deletion')
        return
      }

      const confirmMessage = `Are you sure you want to delete album "${album.title}"?\n\nThis action cannot be undone.`
      if (!confirm(confirmMessage)) {
        return
      }

      try {
        console.log('Deleting album:', album.title)

        await albumService.delete(album.album_id)

        this.albums = this.albums.filter(a => a.album_id !== album.album_id)

        console.log('Album deleted successfully')
        alert(`Album "${album.title}" has been deleted successfully.`)

        await this.fetchAlbums()

      } catch (error) {
        console.error('Error deleting album:', error)
        const errorMessage = error.response?.data?.message || error.message
        alert(`Failed to delete album: ${errorMessage}`)

        await this.fetchAlbums()
      }
    },



    closeModal() {
      console.log('Closing album modal')
      this.showModal = false
      this.selectedAlbum = null
      this.modalMode = 'add'
    }
  },

  mounted() {
    this.fetchAlbums()
  }
}
</script>
