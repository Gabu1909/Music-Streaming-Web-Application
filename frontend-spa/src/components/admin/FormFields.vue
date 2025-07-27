<template>
  <div>
    <div v-if="type === 'text'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <input
        :value="modelValue"
        @input="updateValue($event.target.value)"
        type="text"
        :placeholder="placeholder"
        :required="required"
      />
      <div v-if="note" class="field-note">{{ note }}</div>
    </div>

    <div v-else-if="type === 'email'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <input
        :value="modelValue"
        @input="updateValue($event.target.value)"
        type="email"
        :placeholder="placeholder"
        :required="required"
      />
      <div v-if="note" class="field-note">{{ note }}</div>
    </div>

    <div v-else-if="type === 'password'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <input
        :value="modelValue"
        @input="updateValue($event.target.value)"
        type="password"
        :placeholder="placeholder"
        :required="required"
        :minlength="minLength"
      />
      <div v-if="note" class="field-note">{{ note }}</div>
    </div>

    <div v-else-if="type === 'date'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <input
        :value="modelValue"
        @input="updateValue($event.target.value)"
        type="date"
        :required="required"
      />
      <div v-if="note" class="field-note">{{ note }}</div>
    </div>

    <div v-else-if="type === 'select'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <select
        :value="modelValue"
        @change="updateValue($event.target.value)"
        :required="required"
      >
        <option value="">{{ placeholder || `Select ${label.toLowerCase()}` }}</option>
        <option v-for="option in options" :key="option.value || option" :value="option.value || option">
          {{ option.label || option }}
        </option>
      </select>
      <div v-if="note" class="field-note">{{ note }}</div>
    </div>

    <div v-else-if="type === 'textarea'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <textarea
        :value="modelValue"
        @input="updateValue($event.target.value)"
        :placeholder="placeholder"
        :required="required"
        :rows="rows || 4"
      ></textarea>
      <div v-if="note" class="field-note">{{ note }}</div>
    </div>

    <div v-else-if="type === 'file'" class="form-group">
      <label>
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <div class="file-upload-container">
        <input
          ref="fileInput"
          @change="handleFileChange"
          type="file"
          :accept="accept"
          :multiple="multiple"
          style="display: none"
        />
        <button
          type="button"
          @click="openFileDialog"
          class="file-upload-btn"
          :class="{ 'has-file': hasFile }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          {{ fileButtonText }}
        </button>

        <div v-if="selectedFile && !multiple" class="file-details">
          <span class="file-info">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
          <button type="button" @click="removeFile" class="remove-file-btn">×</button>
        </div>

        <div v-if="selectedFiles && multiple && selectedFiles.length > 0" class="selected-files">
          <div class="files-header">
            <span>Selected Files ({{ selectedFiles.length }})</span>
            <button type="button" @click="clearAllFiles" class="clear-all-btn">Clear All</button>
          </div>
          <div class="files-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="file-info-detail">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <button type="button" @click="removeFileAt(index)" class="remove-file-btn">×</button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="note" class="field-note">{{ note }}</div>

      <div v-if="filePreview && accept && accept.includes('image')" class="image-preview">
        <img :src="filePreview" :alt="`${label} preview`" />
      </div>
    </div>

    <div v-else-if="type === 'row'" class="form-row">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormFields',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => [
        'text', 'email', 'password', 'date', 'select', 
        'textarea', 'file', 'row'
      ].includes(value)
    },
    label: {
      type: String,
      default: ''
    },
    modelValue: {
      type: [String, Number, File, Array],
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    note: {
      type: String,
      default: ''
    },

    options: {
      type: Array,
      default: () => []
    },

    rows: {
      type: Number,
      default: 4
    },

    accept: {
      type: String,
      default: '*/*'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 
    },

    minLength: {
      type: Number,
      default: 6
    }
  },
  emits: ['update:modelValue', 'file-selected', 'file-removed'],
  data() {
    return {
      selectedFile: null,
      selectedFiles: [],
      filePreview: null
    }
  },
  computed: {
    hasFile() {
      return this.multiple ? this.selectedFiles.length > 0 : !!this.selectedFile
    },
    fileButtonText() {
      if (this.multiple) {
        return this.selectedFiles.length > 0 
          ? `${this.selectedFiles.length} files selected`
          : `Choose ${this.label || 'Files'}`
      }
      return this.selectedFile ? this.selectedFile.name : `Choose ${this.label || 'File'}`
    }
  },
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value)
    },

    openFileDialog() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click()
      }
    },

    handleFileChange(event) {
      const files = Array.from(event.target.files || [])
      
      if (files.length === 0) {
        return
      }

      console.log(`Files selected: ${files.length}`, files.map(f => f.name))
      
      if (this.multiple) {
        const validFiles = []
        files.forEach(file => {
          if (this.validateFile(file)) {
            validFiles.push(file)
          }
        })
        
        if (validFiles.length > 0) {
          this.selectedFiles = validFiles
          this.$emit('file-selected', validFiles)
          console.log(`Valid files selected: ${validFiles.length}`)
        }
      } else {
        const file = files[0]
        if (file && this.validateFile(file)) {
          this.selectedFile = file
          this.$emit('file-selected', file)
          console.log(`File selected: ${file.name}`)

          if (this.accept && this.accept.includes('image')) {
            this.createFilePreview(file)
          }
        }
      }
    },

    validateFile(file) {
      console.log(`🔍 Validating file: ${file.name}`, {
        type: file.type,
        size: this.formatFileSize(file.size),
        accept: this.accept
      })

      if (this.accept && this.accept !== '*/*') {
        const acceptedTypes = this.accept.split(',').map(type => type.trim())
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase())
          }

          if (type.includes('*')) {
            const baseType = type.split('/')[0]
            return file.type.startsWith(baseType)
          }
          return file.type === type
        })
        
        if (!isValidType) {
          alert(`Invalid file type. Please select: ${this.accept}`)
          return false
        }
      }

      if (file.size > this.maxSize) {
        alert(`File too large. Maximum size: ${this.formatFileSize(this.maxSize)}`)
        return false
      }
      
      console.log(`File validation passed: ${file.name}`)
      return true
    },

    createFilePreview(file) {
      if (!file.type.startsWith('image/')) {
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        this.filePreview = e.target.result
        console.log('Image preview created')
      }
      reader.onerror = () => {
        console.error('Failed to create image preview')
      }
      reader.readAsDataURL(file)
    },

    removeFile() {
      console.log('Removing file:', this.selectedFile?.name)
      this.selectedFile = null
      this.filePreview = null
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      
      this.$emit('file-removed')
    },

    removeFileAt(index) {
      const removedFile = this.selectedFiles[index]
      console.log('Removing file at index', index, ':', removedFile?.name)
      
      this.selectedFiles.splice(index, 1)
      
      if (this.selectedFiles.length === 0 && this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    clearAllFiles() {
      console.log('🗑️ Clearing all files:', this.selectedFiles.length)
      this.selectedFiles = []
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      
      this.$emit('file-removed')
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
.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.field-note {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

/* File Upload Styles */
.file-upload-container {
  margin-top: 0.5rem;
}

.file-upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  font-size: 0.875rem;
}

.file-upload-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.file-upload-btn.has-file {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
}

.file-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-file-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
}

.selected-files {
  margin-top: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  font-weight: 500;
}

.clear-all-btn {
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.files-list {
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-size: 0.875rem;
  color: #374151;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

/* Responsive */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>