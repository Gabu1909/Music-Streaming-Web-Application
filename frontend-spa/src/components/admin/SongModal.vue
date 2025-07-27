<template>
  <BaseModal
    :show="show"
    :mode="mode"
    title="Song"
    :form-data="songData"
    :is-form-valid="isFormValid"
    :is-saving="isSaving"
    @save="saveSong"
    @cancel="$emit('cancel')"
  >
    <template #form-content>
      <FormFields type="row">
        <FormFields
          type="text"
          label="Title"
          v-model="songData.title"
          placeholder="Enter song title"
          required
        />
        <FormFields
          type="text"
          label="Artist"
          v-model="songData.artist"
          placeholder="Enter artist name"
          required
        />
      </FormFields>
      <FormFields
        type="text"
        label="Album"
        v-model="songData.album"
        placeholder="Album name (optional)"
      />

      <FormFields
        type="file"
        label="Audio File"
        accept="audio/*"
        :required="mode === 'add'"
        :note="mode === 'add' ? 'Audio file is required for new songs (any size)' : 'Upload new audio file to replace current one'"
        @file-selected="handleAudioSelected"
        @file-removed="handleAudioRemoved"
      />

      <div v-if="mode === 'edit' && song.audio_files && !selectedAudioFile" class="current-file-info">
        <div class="field-note">
          <strong>Current file:</strong> {{ getFileName(song.audio_files) }}
        </div>
      </div>

      <div v-if="audioDuration" class="audio-info">
        <div class="field-note">
          <strong>Duration:</strong> {{ formatDuration(audioDuration) }}
        </div>
      </div>

      <div v-if="showDebug" class="debug-info">
        <p><strong>Form Valid:</strong> {{ isFormValid }}</p>
        <p><strong>Has Title:</strong> {{ !!songData.title.trim() }}</p>
        <p><strong>Has Artist:</strong> {{ !!songData.artist.trim() }}</p>
        <p><strong>Has Audio:</strong> {{ hasAudioFile }}</p>
        <p><strong>Mode:</strong> {{ mode }}</p>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/admin/Modal.vue'
import FormFields from '@/components/admin/FormFields.vue'

export default {
  name: 'SongModal',
  components: {
    BaseModal,
    FormFields
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    song: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add'
    }
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      isSaving: false,
      selectedAudioFile: null,
      audioDuration: null,
      songData: {
        id: null,
        title: '',
        artist: '',
        album: ''
      },
      showDebug: true
    }
  },
  computed: {
    hasAudioFile() {
      if (this.mode === 'edit') {
        return this.selectedAudioFile || (this.song && this.song.audio_files)
      }
      return !!this.selectedAudioFile
    },
    isFormValid() {
      const hasRequiredFields = this.songData.title.trim() && this.songData.artist.trim()
      return !!hasRequiredFields && !!this.hasAudioFile
    }
  },
  watch: {
    song: {
      handler(newSong) {
        this.updateFormData(newSong)
      },
      immediate: true,
      deep: true
    },
    show(isVisible) {
      if (isVisible) {
        this.updateFormData(this.song)
        this.selectedAudioFile = null
        this.audioDuration = null
      }
    }
  },
  methods: {
    updateFormData(song) {
      const songObj = song || {}
      this.songData = {
        id: songObj.song_id || songObj.id || null,
        title: songObj.title || '',
        artist: songObj.artist_name ||
                (songObj.artists && songObj.artists.length > 0 ? songObj.artists[0].name : '') ||
                '',
        album: songObj.album || ''
      }
      console.log('Updated songData:', this.songData)
    },
    handleAudioSelected(file) {
      this.selectedAudioFile = file
      this.getAudioDuration(file)
    },
    handleAudioRemoved() {
      this.selectedAudioFile = null
      this.audioDuration = null
    },
    getAudioDuration(file) {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      audio.addEventListener('loadedmetadata', () => {
        this.audioDuration = audio.duration
        URL.revokeObjectURL(url)
      })
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
      })
      audio.src = url
    },
    async saveSong() {
  if (!this.isFormValid) return;

  this.isSaving = true;
  try {
    const formData = new FormData();

    // Component tự chuẩn bị dữ liệu
    formData.append('title', this.songData.title.trim());
    formData.append('artist', this.songData.artist.trim());

    if (this.songData.album.trim()) {
      formData.append('album', this.songData.album.trim());
    }

    if (this.selectedAudioFile) {
      formData.append('audio_files', this.selectedAudioFile);
    }


    this.$emit('save', formData);

  } catch (error) {
    console.error('Error preparing data:', error);
    alert('Error preparing data');
  } finally {
    this.isSaving = false;
  }
},
    getFileName(path) {
      if (!path) return 'Unknown'
      const parts = path.split('/')
      return parts[parts.length - 1] || 'Unknown'
    },
    formatDuration(seconds) {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }
}
</script>


