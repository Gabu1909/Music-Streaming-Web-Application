<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop ref="modalContent">
      <div class="modal-header">
        <h2>
          <span class="modal-icon">{{ modalIcon }}</span>
          {{ modalTitle }}
        </h2>
        <button @click="$emit('cancel')" class="close-btn" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <slot name="form-content" :formData="formData" :isFormValid="isFormValid" />

        <div class="modal-actions">
          <button type="button" @click="$emit('cancel')" class="btn btn-cancel">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSaving || !isFormValid"
          >Save
            <div v-if="isSaving" class="loading-spinner"></div>
            {{ isSaving ? 'Saving...' : saveButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    isFormValid: {
      type: Boolean,
      default: true
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    saveButtonText: {
      type: String,
      default: ''
    }
  },
  emits: ['save', 'cancel'],
  computed: {
    modalIcon() {
      return this.icon
    },
    modalTitle() {
      const action = this.mode === 'edit' ? 'Edit' : 'Add New'
      return `${action} ${this.title}`
    },
    computedSaveButtonText() {
      if (this.saveButtonText) return this.saveButtonText
      const action = this.mode === 'edit' ? 'Update' : 'Add'
      return `${action} ${this.title}`
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('cancel')
    },

    handleSubmit() {
      if (this.isFormValid && !this.isSaving) {
        this.$emit('save')
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-icon {
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-form {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-cancel:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.btn-primary:hover:not(:disabled) {
  background: #7c3aed;
  border-color: #7c3aed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.form-group) {
  margin-bottom: 1.25rem;
}

:deep(.form-row) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

:deep(.form-group label) {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

:deep(.form-group input),
:deep(.form-group select),
:deep(.form-group textarea) {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

:deep(.form-group input:focus),
:deep(.form-group select:focus),
:deep(.form-group textarea:focus) {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

:deep(.form-group textarea) {
  resize: vertical;
  min-height: 80px;
}

:deep(.field-note) {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

/* File Upload Styles */
:deep(.file-upload-container) {
  margin-top: 0.5rem;
}

:deep(.file-upload-btn) {
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

:deep(.file-upload-btn:hover) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

:deep(.file-upload-btn.has-file) {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
}

:deep(.file-details) {
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

:deep(.remove-file-btn) {
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

:deep(.image-preview) {
  margin-top: 1rem;
  text-align: center;
}

:deep(.image-preview img) {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

@media (max-width: 640px) {
  .modal-content {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  :deep(.form-row) {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
