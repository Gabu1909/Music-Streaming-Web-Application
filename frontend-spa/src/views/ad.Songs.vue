<template>
    <EntityTable v-bind="tableConfig" :rows="songs" @add="openAddSong" @edit="openEditSong" @delete="deleteSong"
      @view="viewSong" />
    <SongModal :show="showModal" :song="selectedSong || {}" :mode="modalMode" @save="saveSong" @cancel="closeModal" />
</template>

<script>
import EntityTable from '@/layout/EntityTable.vue'
import SongModal from '@/components/admin/SongModal.vue'
import SongService from '@/services/song.service'

export default {
  name: 'Songs',
  components: {
    EntityTable,
    SongModal
  },
  data() {
    return {
      songs: [],
      showModal: false,
      selectedSong: null,
      modalMode: 'add',
      tableConfig: {
        tableTitle: 'Songs Library',
        entityName: 'songs',
        searchPlaceholder: 'Search songs by title, artist...',
        addButtonText: 'Add Song',
        emptyMessage: 'No songs found. Upload your first song to get started.',
        showPlayButton: false,
        itemsPerPage: 20,
        searchableColumns: ['title', 'artist_name'],
        columns: [
          {
            key: 'song_id',
            label: 'ID',
            type: 'text',
            sortable: true,
            maxLength: 10
          },
          {
            key: 'title',
            label: 'Title',
            type: 'text',
            sortable: true,
            maxLength: 40
          },
          {
            key: 'artist_name',
            label: 'Artist',
            type: 'text',
            sortable: true,
            maxLength: 30
          },
          {
            key: 'duration',
            label: 'Duration',
            type: 'duration',
            sortable: true
          },
          {
            key: 'audio_url',
            label: 'Audio File',
            type: 'text',
            sortable: false,
            maxLength: 25
          },
          {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            sortable: false
          }
        ]
      }
    }
  },
  methods: {
    async fetchSongs() {
      try {
        const response = await SongService.getSongs();

        // Component tự xử lý cấu trúc response
        let songsData = [];

        if (Array.isArray(response)) {
          songsData = response;
        } else if (response?.data) {
          songsData = Array.isArray(response.data) ? response.data : response.data.songs || [];
        }

        // Xử lý dữ liệu bài hát
        this.songs = songsData.map(song => ({
          song_id: song.song_id || song.id,
          title: song.title || 'Unknown Title',
          artist_name: this.getArtistName(song),
          duration: song.duration || 0,
          audio_url: song.audio_url || '',
          image_url: song.image_url || null,
          artists: song.artists || []
        }));

      } catch (error) {
        console.error('Error fetching songs:', error);
        alert(`Failed to load songs: ${error.message}`);
        this.songs = [];
      }
    },

    getArtistName(song) {
      if (song.artists?.length) {
        return song.artists.map(artist => artist.name).join(', ');
      }
      return song.artist_name || 'Unknown Artist';
    },

    async saveSong(formData) {
      try {
        let response;
        if (this.modalMode === 'edit' && this.selectedSong?.song_id) {
          response = await SongService.updateSong(this.selectedSong.song_id, formData);
        } else {
          response = await SongService.createSong(formData);
        }

        // Xử lý response tại component
        console.log('API response:', response);

        if (response.error) {
          throw new Error(response.error);
        }

        this.closeModal();
        await this.fetchSongs();
        alert('Operation completed successfully');

      } catch (error) {
        console.error('Error saving song:', error);
        alert(`Error: ${error.message}`);
      }
    },
    openAddSong() {
      this.selectedSong = {}
      this.modalMode = 'add'
      this.showModal = true
    },

    openEditSong(song) {
      this.selectedSong = { ...song }
      this.modalMode = 'edit'
      this.showModal = true
    },

    viewSong(song) {
      if (!song) return
      const details = `
ID: ${song.song_id}
Title: ${song.title}
Artist(s): ${song.artist_name}
Duration: ${this.formatDuration(song.duration)}
Audio: ${song.audio_url || 'None'}
Image: ${song.image_url || 'None'}
`
      alert(details)
    },

    async deleteSong(song) {
      if (!song || !song.song_id) return
      try {
        await SongService.deleteSong(song.song_id)
        this.songs = this.songs.filter(s => s.song_id !== song.song_id)
        alert(`Deleted "${song.title}" successfully.`)
      } catch (error) {
        console.error('Error deleting:', error)
        alert(`Failed to delete song: ${error.message}`)
      }
    },


    closeModal() {
      this.showModal = false
      this.selectedSong = null
      this.modalMode = 'add'
    },

    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  },

  mounted() {
    this.fetchSongs()
  }
}
</script>
