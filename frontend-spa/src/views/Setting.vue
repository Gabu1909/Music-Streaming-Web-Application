<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuth } from '@/hooks/useAuth'
import authService from '@/services/auth.service'

const router = useRouter()
const queryClient = useQueryClient()
const { userId, showToast, validateEmail } = useAuth()

const defaultAvatar = 'uploads/img/default-avatar.jpg'
const username = ref('')
const email = ref("")
const avatarFile = ref(null)
const avatarPreview = ref(null)

const { data: userData, isLoading, isError } = useQuery({
  queryKey: ['user', userId],
  queryFn: async () => {
    if (!userId.value) throw new Error('No user ID')
    const response = await authService.getUser()
    if (response.status === 'success' && response.data?.user_id) {
      return response.data
    }
    throw new Error('Invalid user data')
  },
  enabled: !!userId.value,
})

watch(userData, (newUserData) => {
  if (newUserData) {
    username.value = newUserData.username || newUserData.email || 'User'
    email.value = newUserData.email || ''
    avatarPreview.value = newUserData.avatar_url || defaultAvatar
  }
}, { immediate: true })

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.match('image.*')) {
    showToast('Please select a valid image file', 'error')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must not exceed 2MB', 'error')
    return
  }

  avatarFile.value = file

  const reader = new FileReader()
  reader.onload = (event) => {
    avatarPreview.value = event.target.result
  }
  reader.readAsDataURL(file)
}

const updateProfileMutation = useMutation({
  mutationFn: async (formData) => {
    if (!userId.value) throw new Error('No user ID');
    console.log('Calling updateProfile with userId:', userId.value);
    return await authService.updateProfile(userId.value, formData);
  },
  onSuccess: (response) => {
    console.log('Profile update success:', response);
    if (response?.status === 'success') {
      showToast('🎉 Profile updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['user', userId.value] });
      setTimeout(() => router.push('/'), 1500);
    } else {
      showToast(response?.message || 'Profile update failed', 'error');
    }
  },
  onError: (error) => {
    console.log('Profile update error:', error);
    let message = 'Profile update failed';
    if (error.message.includes('Failed to fetch')) {
      message = 'Network error: Unable to reach the server';
    } else if (error.message.includes('No token found')) {
      message = 'Please log in again';
    } else {
      message = error.message || message;
    }
    showToast(message, 'error');
  },
});

const handleUpdateProfile = () => {
  console.log('Token:', localStorage.getItem('token'));
  console.log('UserId:', userId.value);
  if (!userId.value) {
    showToast('User ID not found', 'error');
    return;
  }
  if (!username.value || !email.value) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  if (!validateEmail(email.value)) {
    showToast('Invalid email format', 'error');
    return;
  }
  const formData = new FormData();
  formData.append('username', username.value);
  formData.append('email', email.value);
  if (avatarFile.value) {
    formData.append('avatar_url', avatarFile.value);
  }
  updateProfileMutation.mutate(formData);
};
const handleCancel = () => {
  router.push('/')
}

const isFormChanged = computed(() => {
  if (!userData.value) return false
  return (
    username.value !== (userData.value.username || userData.value.email || 'User') ||
    email.value !== (userData.value.email || '') ||
    avatarFile.value !== null
  )
})

const isUpdating = computed(() => updateProfileMutation.isPending)
</script>

<template>
  <div class="settings-container">
    <h1 class="settings-title">Profile Settings</h1>
    <div v-if="isLoading" class="loading">Loading profile...</div>
    <div v-else-if="isError" class="error">Failed to load profile. Please try again.</div>
    <div v-else class="settings-form">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Enter your username"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="avatar">Profile Picture</label>
        <div class="avatar-container">
          <img
            :src="avatarPreview || defaultAvatar"
            alt="Profile Picture Preview"
            class="avatar-preview"
          />
          <input
            id="avatar"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="avatar-input"
          />
        </div>
      </div>
      <div class="form-actions">
        <button
          :disabled="!isFormChanged"
          @click="handleUpdateProfile"
          class="save-btn"
        >
          Save Changes
        </button>
        <button @click="handleCancel" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.settings-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  border: 1px solid rgba(255, 94, 188, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.settings-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ff5ebc;
  margin-bottom: 20px;
  text-align: center;
}

.loading,
.error {
  text-align: center;
  color: #ccc;
  font-size: 1.1rem;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 94, 188, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #ff5ebc;
  box-shadow: 0 0 10px rgba(255, 94, 188, 0.3);
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid rgba(255, 94, 188, 0.5);
  object-fit: cover;
}

.avatar-input {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 94, 188, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: #ff5ebc;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #ff8fd4;
  transform: scale(1.05);
}

.save-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  border: 1px solid rgba(255, 94, 188, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 94, 188, 0.2);
  color: #ff5ebc;
}

@media (max-width: 768px) {
  .settings-container {
    margin: 20px;
    padding: 15px;
  }

  .settings-title {
    font-size: 1.5rem;
  }

  .form-input,
  .avatar-input {
    font-size: 0.9rem;
  }

  .avatar-preview {
    width: 60px;
    height: 60px;
  }
}
</style>
