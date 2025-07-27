<template>
  <BaseModal
    :show="show"
    :mode="mode"
    title="Album"
    :is-form-valid="isFormValid"
    :is-saving="isSaving"
    @save="saveAlbum"
    @cancel="$emit('cancel')"
  >
    <template #form-content>
      <FormFields type="row">
        <FormFields
          type="text"
          label="Title"
          v-model="form.title"
          placeholder="Enter album title"
          required
        />
        <FormFields
          type="text"
          label="Artist"
          v-model="form.artist"
          placeholder="Enter artist name (not ID)"
          required
          note="Enter the artist name (e.g., 'Sơn Tùng M-TP'), not the ID number"
        />
      </FormFields>

      <FormFields
        type="date"
        label="Release Date"
        v-model="form.release_date"
        note="Optional: When was this album released?"
      />

      <FormFields
        type="file"
        label="Cover Image"
        accept="image/*"
        :max-size="10 * 1024 * 1024"
        note="Cover image will be stored as binary data (max 10MB)"
        @file-selected="handleCoverSelected"
        @file-removed="handleCoverRemoved"
      />

      <FormFields
        type="file"
        label="Songs"
        accept="audio/*"
        multiple
        note="Select one or more audio files to add as songs to this album (optional)"
        @file-selected="handleSongsSelected"
        @file-removed="handleSongsRemoved"
      />

      <div v-if="mode === 'edit' && album.cover_url && !selectedCoverFile" class="current-file-info">
        <div class="field-note">
          <strong>Current cover:</strong> {{ getFileName(album.cover_url) }}
        </div>
      </div>

      <div v-if="selectedSongFiles.length" class="songs-info">
        <div class="field-note">
          <strong>Selected songs:</strong>
          <ul>
            <li v-for="(file, index) in selectedSongFiles" :key="index">
              {{ file.name }} ({{ formatFileSize(file.size) }})
            </li>
          </ul>
        </div>
      </div>

      <div v-if="showDebug" class="debug-info">
        <p><strong>Form Valid:</strong> {{ isFormValid }}</p>
        <p><strong>Has Title:</strong> {{ !!form.title.trim() }}</p>
        <p><strong>Has Artist:</strong> {{ !!form.artist.toString().trim() }}</p>
        <p><strong>Artist:</strong> {{ form.artist }}</p>
        <p><strong>Mode:</strong> {{ mode }}</p>
        <p><strong>Has Cover:</strong> {{ !!selectedCoverFile }}</p>
        <p><strong>Selected Songs:</strong> {{ selectedSongFiles.length }}</p>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/admin/Modal.vue'
import FormFields from '@/components/admin/FormFields.vue'
import albumsService from '@/services/album.service'

export default {
  name: 'AlbumModal',
  components: { BaseModal, FormFields },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    album: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit'].includes(value)
    }
  },
  emits: ['saved', 'cancel'],
  data() {
    return {
      isSaving: false,
      selectedCoverFile: null,
      selectedSongFiles: [],
      form: {
        id: null,
        title: '',
        artist: '',
        release_date: ''
      },
      showDebug: true
    }
  },
  computed: {
    isFormValid() {
      const hasTitle = !!(this.form.title && this.form.title.trim().length > 0)
      const hasArtist = !!(this.form.artist && this.form.artist.toString().trim().length > 0)
      return hasTitle && hasArtist
    }
  },
  watch: {
    album: {
      handler(newAlbum) {
        this.updateFormData(newAlbum)
      },
      immediate: true,
      deep: true
    },
    show(isVisible) {
      if (isVisible) {
        this.updateFormData(this.album)
        this.selectedCoverFile = null
        this.selectedSongFiles = []
      } else {
        this.selectedCoverFile = null
        this.selectedSongFiles = []
        this.isSaving = false
      }
    }
  },
  methods: {
    updateFormData(album) {
      const albumObj = album || {}
      this.form = {
        id: albumObj.album_id || albumObj.id || null,
        title: String(albumObj.title || '').trim(),
        artist: albumObj.artist_name || albumObj.artist || '',
        release_date: albumObj.release_date || ''
      }
      console.log('Album form data updated:', { ...this.form })
    },
    handleCoverSelected(file) {
      this.selectedCoverFile = file
      console.log('Cover selected:', file.name, this.formatFileSize(file.size))
    },
    handleCoverRemoved() {
      this.selectedCoverFile = null
      console.log('Cover removed')
    },
    handleSongsSelected(files) {
      this.selectedSongFiles = Array.from(files)
      console.log('Songs selected:', this.selectedSongFiles.map(f => `${f.name} (${this.formatFileSize(f.size)})`))
    },
    handleSongsRemoved() {
      this.selectedSongFiles = []
      console.log('Songs removed')
    },
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    getFileName(path) {
      if (!path) return 'Unknown'
      const parts = String(path).split('/')
      return parts[parts.length - 1] || 'Unknown'
    },
    async saveAlbum() {
      if (!this.isFormValid) {
        alert('Please fill in all required fields.')
        return
      }

      this.isSaving = true
      try {
        const formData = new FormData()
        const albumTitle = this.form.title.trim()
        const artist = this.form.artist.toString().trim()

        if (!albumTitle) throw new Error('Album title is required')
        if (!artist) throw new Error('Artist is required')

        formData.append('title', albumTitle)
        formData.append('artist', artist)
        if (this.form.release_date) formData.append('release_date', this.form.release_date)
        if (this.selectedCoverFile) formData.append('cover', this.selectedCoverFile)
        this.selectedSongFiles.forEach((file, index) => {
          formData.append('audio_files', file)
          console.log(`Song file ${index + 1} attached: ${file.name}`)
        })

        if (this.mode === 'edit' && this.form.id) {
          formData.append('album_id', this.form.id)
        }

        console.log('FormData entries:')
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}: ${value instanceof File ? `File: ${value.name}` : value}`)
        }

        let result
        if (this.mode === 'edit' && this.form.id) {
          result = await albumsService.updateAlbum(this.form.id, formData)
        } else {
          result = await albumsService.createAlbum(formData)
        }

        console.log('Album saved:', result)
        this.$emit('saved', result)
      } catch (error) {
        console.error('Save album failed:', error)
        alert(`Failed to save album: ${error.message}`)
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>
