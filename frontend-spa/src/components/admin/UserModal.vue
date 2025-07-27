<template>
  <BaseModal
    :show="show"
    :mode="mode"
    title="User"
    :form-data="userData"
    :is-form-valid="isFormValid"
    :is-saving="isSaving"
    @save="saveUser"
    @cancel="$emit('cancel')"
  >
    <template #form-content>
      <FormFields type="row">
        <FormFields
          type="text"
          label="Name"
          v-model="userData.name"
          placeholder="Enter full name"
          required
        />
        <FormFields
          type="email"
          label="Email"
          v-model="userData.email"
          placeholder="Enter email address"
          required
        />
      </FormFields>

      <FormFields type="row">
        <FormFields
          type="select"
          label="Role"
          v-model="userData.role"
          :options="roleOptions"
          placeholder="Select role"
          required
        />
        <FormFields
          v-if="mode === 'add'"
          type="password"
          label="Password"
          v-model="userData.password"
          placeholder="Enter password"
          :min-length="6"
          required
        />
      </FormFields>

      <FormFields
        v-if="mode === 'edit'"
        type="password"
        label="New Password"
        v-model="userData.password"
        placeholder="Leave empty to keep current password"
        :min-length="6"
        note="Leave empty if you don't want to change the password"
      />

      <FormFields
        type="file"
        label="Avatar Image"
        accept="image/*"
        :max-size="5 * 1024 * 1024"
        note="Avatar will be stored as binary data (max 5MB)"
        @file-selected="handleAvatarSelected"
        @file-removed="handleAvatarRemoved"
      />

      <div v-if="mode === 'edit' && user.avatar_url && !selectedAvatarFile" class="current-file-info">
        <div class="field-note">
          <strong>Current avatar:</strong> {{ getFileName(user.avatar_url) }}
        </div>
      </div>

      <div v-if="showDebug" class="debug-info">
        <p><strong>Form Valid:</strong> {{ isFormValid }}</p>
        <p><strong>Has Name:</strong> {{ !!userData.name.trim() }}</p>
        <p><strong>Has Email:</strong> {{ !!userData.email.trim() }}</p>
        <p><strong>Has Role:</strong> {{ !!userData.role }}</p>
        <p><strong>Has Password (Add):</strong> {{ mode === 'add' ? !!userData.password : 'N/A' }}</p>
        <p><strong>Mode:</strong> {{ mode }}</p>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '../Modal/Modal.vue'
import FormFields from '../Modal/FormFields.vue'

export default {
  name: 'UserModal',
  components: {
    BaseModal,
    FormFields
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    user: {
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
      selectedAvatarFile: null,
      userData: {
        id: null,
        name: '',
        email: '',
        role: '',
        password: ''
      },
      roleOptions: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ],
     
    }
  },
  computed: {
    isFormValid() {
      const hasRequiredFields = this.userData.name.trim() && 
                               this.userData.email.trim() && 
                               this.userData.role

      const hasPassword = this.mode === 'edit' || this.userData.password

      const isValid = hasRequiredFields && hasPassword

      console.log('User form validation:', {
        isValid,
        hasRequiredFields,
        hasPassword,
        mode: this.mode,
        name: this.userData.name,
        email: this.userData.email,
        role: this.userData.role
      })

      return isValid
    }
  },
  watch: {
    user: {
      handler(newUser) {
        this.updateFormData(newUser)
      },
      immediate: true,
      deep: true
    },

    show(isVisible) {
      if (isVisible) {
        this.updateFormData(this.user)
        this.selectedAvatarFile = null
      }
    }
  },
  methods: {
    updateFormData(user) {
      const userObj = user || {}
      this.userData = {
        id: userObj.user_id || userObj.id || null,
        name: userObj.username || userObj.name || '',
        email: userObj.email || '',
        role: userObj.role || '',
        password: '' 
      }
      
      console.log('User form data updated:', {
        ...this.userData,
        password: '***' 
      })
    },

    handleAvatarSelected(file) {
      this.selectedAvatarFile = file
      console.log('Avatar selected:', file.name, this.formatFileSize(file.size))
    },

    handleAvatarRemoved() {
      this.selectedAvatarFile = null
      console.log('Avatar removed')
    },

    async saveUser() {
      if (!this.isFormValid) {
        console.error('Form is not valid, cannot save')
        alert('Please fill in all required fields.')
        return
      }
      
      this.isSaving = true
      try {
        const formData = new FormData()

        formData.append('username', this.userData.name.trim())
        formData.append('email', this.userData.email.trim())
        formData.append('role', this.userData.role)

        if (this.userData.password && this.userData.password.trim()) {
          formData.append('password', this.userData.password.trim())
        }

        if (this.selectedAvatarFile) {
          formData.append('avatar_url', this.selectedAvatarFile)
          console.log('Avatar file attached:', this.selectedAvatarFile.name)
        }

        if (this.mode === 'edit' && this.userData.id) {
          formData.append('id', this.userData.id)
        }

        const logData = {
          username: this.userData.name,
          email: this.userData.email,
          role: this.userData.role,
          hasPassword: !!this.userData.password,
          hasAvatar: !!this.selectedAvatarFile,
          avatarFileName: this.selectedAvatarFile?.name,
          mode: this.mode,
          id: this.userData.id
        }
        console.log('Saving user with data:', logData)
        this.$emit('save', formData)
        
      } catch (error) {
        console.error('Error preparing user data:', error)
        alert('Error preparing user data. Please try again.')
      } finally {
        this.isSaving = false
      }
    },

    getFileName(path) {
      if (!path) return 'Unknown'
      const parts = path.split('/')
      return parts[parts.length - 1] || 'Unknown'
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
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