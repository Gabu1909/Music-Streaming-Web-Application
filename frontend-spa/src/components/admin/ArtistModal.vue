<template>
  <BaseModal
    :show="show"
    :mode="mode"
    title="Artist"
    :form-data="artistData"
    :is-form-valid="isFormValid"
    :is-saving="isSaving"
    @save="saveArtist"
    @cancel="handleCancel"
  >
    <template #form-content>
      <FormFields
        type="text"
        label="Artist's Full Name"
        v-model="artistData.name"
        placeholder="Enter artist's full name"
        required
        :disabled="isSaving"
        @input="validateForm"
      />

      <FormFields
        type="textarea"
        label="Biography"
        v-model="artistData.bio"
        placeholder="Short biography of the artist"
        :rows="4"
        :disabled="isSaving"
        note="Optional: Brief description about the artist"
      />

      <FormFields
        type="file"
        label="Avatar Image"
        accept="image/*"
        :max-size="10 * 1024 * 1024"
        :disabled="isSaving"
        note="Avatar will be stored as binary data (max 10MB)"
        @file-selected="handleAvatarSelected"
        @file-removed="handleAvatarRemoved"
      />

      <div v-if="mode === 'edit' && artist.avatar_url && !selectedAvatarFile" class="current-file-info">
        <div class="field-note">
          <strong>Current avatar:</strong> {{ getFileName(artist.avatar_url) }}
        </div>
      </div>

      <!-- Error message display -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Success message display -->
      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
      </div>

      <div v-if="showDebug" class="debug-info">
        <p><strong>Form Valid:</strong> {{ isFormValid }}</p>
        <p><strong>Has Name:</strong> {{ !!artistData.name.trim() }}</p>
        <p><strong>Mode:</strong> {{ mode }}</p>
        <p><strong>Has Avatar:</strong> {{ !!selectedAvatarFile }}</p>
        <p><strong>Avatar File Name:</strong> {{ selectedAvatarFile?.name || 'None' }}</p>
        <p><strong>Is Saving:</strong> {{ isSaving }}</p>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/admin/Modal.vue'
import FormFields from '@/components/admin/FormFields.vue'

export default {
  name: 'ArtistModal',
  components: {
    BaseModal,
    FormFields
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    artist: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit'].includes(value)
    },
    showDebug: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel', 'success', 'error'],
  data() {
    return {
      isSaving: false,
      selectedAvatarFile: null,
      errorMessage: '',
      successMessage: '',
      artistData: {
        id: null,
        name: '',
        bio: ''
      }
    }
  },
  computed: {
    isFormValid() {
      const hasName = !!(this.artistData.name && this.artistData.name.trim().length > 0)

      // Clear previous error if form becomes valid
      if (hasName && this.errorMessage) {
        this.errorMessage = ''
      }

      return Boolean(hasName)
    }
  },
  watch: {
    artist: {
      handler(newArtist) {
        this.updateFormData(newArtist)
      },
      immediate: true,
      deep: true
    },

    show(isVisible) {
      if (isVisible) {
        this.resetModal()
        this.updateFormData(this.artist)
      } else {
        this.resetModal()
      }
    }
  },
  methods: {
    resetModal() {
      this.selectedAvatarFile = null
      this.isSaving = false
      this.errorMessage = ''
      this.successMessage = ''
    },

    updateFormData(artist) {
      const artistObj = artist || {}

      this.artistData = {
        id: artistObj.artist_id || artistObj.id || null,
        name: String(artistObj.name || '').trim(),
        bio: String(artistObj.bio || '').trim()
      }

      console.log('Artist form data updated:', {
        ...this.artistData,
        originalArtist: artistObj,
        isValidAfterUpdate: this.isFormValid
      })
    },

    validateForm() {
      // Real-time validation
      this.errorMessage = ''
      this.successMessage = ''
    },

    handleAvatarSelected(file) {
      this.selectedAvatarFile = file
      this.errorMessage = ''
      console.log('Avatar selected:', file.name, this.formatFileSize(file.size))
    },

    handleAvatarRemoved() {
      this.selectedAvatarFile = null
      console.log('Avatar removed')
    },

    handleCancel() {
      if (this.isSaving) {
        // Prevent cancel while saving
        return
      }
      this.resetModal()
      this.$emit('cancel')
    },

    async saveArtist() {
      // Prevent double submission
      if (this.isSaving) {
        console.log('Save already in progress, ignoring duplicate request')
        return
      }

      // Validate form before saving
      if (!this.isFormValid) {
        this.errorMessage = 'Please enter the artist name.'
        console.error('Form validation failed:', {
          isFormValid: this.isFormValid,
          artistData: this.artistData
        })
        return
      }

      this.isSaving = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const formData = this.prepareFormData()

        const logData = {
          name: this.artistData.name.trim(),
          bio: this.artistData.bio.trim() || '(empty)',
          hasAvatar: !!this.selectedAvatarFile,
          avatarFileName: this.selectedAvatarFile?.name || '(none)',
          mode: this.mode,
          id: this.artistData.id || '(none)'
        }
        console.log('Saving artist with data:', logData)

        // Use the improved save response handler
        await this.handleSaveResponse(formData)

      } catch (error) {
        console.error('Error in saveArtist:', error)
        // Error is already handled in handleSaveResponse
        // Just ensure the saving state is reset
        this.isSaving = false
      }
    },

    prepareFormData() {
      const formData = new FormData()

      // Validate and prepare data
      const artistName = this.artistData.name.trim()
      if (!artistName) {
        throw new Error('Artist name is required')
      }
      formData.append('name', artistName)

      const artistBio = this.artistData.bio.trim()
      if (artistBio) {
        formData.append('bio', artistBio)
      }

      if (this.selectedAvatarFile) {
        // Validate file size again
        if (this.selectedAvatarFile.size > 10 * 1024 * 1024) {
          throw new Error('Avatar file size must be less than 10MB')
        }
        formData.append('avatar_url', this.selectedAvatarFile)
      }

      if (this.mode === 'edit') {
        if (!this.artistData.id) {
          throw new Error('Artist ID is missing for edit operation')
        }
        formData.append('artist_id', this.artistData.id)
        console.log('Edit mode - Artist ID added to FormData:', this.artistData.id)
      }

      return formData
    },

    async handleSaveResponse(formData) {
      return new Promise((resolve, reject) => {
        // Create a timeout for the save operation
        const saveTimeout = setTimeout(() => {
          this.isSaving = false
          const timeoutError = new Error('Save operation timed out. Please try again.')
          this.errorMessage = timeoutError.message
          reject(timeoutError)
        }, 30000) // 30 second timeout

        // Listen for success/error events from parent
        const handleSuccess = () => {
          clearTimeout(saveTimeout)
          this.isSaving = false
          this.successMessage = `Artist ${this.mode === 'edit' ? 'updated' : 'created'} successfully!`
          this.$emit('success')

          // Auto-close modal after success
          setTimeout(() => {
            this.handleCancel()
          }, 1500)

          resolve()
        }

        const handleError = (error) => {
          clearTimeout(saveTimeout)
          this.isSaving = false
          this.errorMessage = error?.message || 'An error occurred while saving'
          // Don't emit error here to avoid duplicate handling
          reject(error)
        }

        // Emit the save event with callbacks
        this.$emit('save', formData, { onSuccess: handleSuccess, onError: handleError })
      })
    },

    getFileName(path) {
      if (!path) return 'Unknown'
      const parts = String(path).split('/')
      return parts[parts.length - 1] || 'Unknown'
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.current-file-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  color: #16a34a;
}

.debug-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.75rem;
}

.debug-info p {
  margin: 0.25rem 0;
}

.field-note {
  font-size: 0.875rem;
  color: #374151;
}
</style>
