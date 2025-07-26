<script setup>
import { useAuth } from '@/hooks/useAuth';

const {
  isLogin,
  email,
  password,
  adminCode,
  avatarFile,
  username,
  avatarPreview,
  toast,
  toggleForm,
  handleFileChange,
  handleLogin,
  handleRegister,
} = useAuth();
</script>

<template>
  <div class="auth-container">
    <div class="blur-bg"></div>

    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="auth-card glassmorphism">
            <div class="text-center mb-4">
              <div class="music-icon">
                <i class="bi bi-music-note-beamed"></i>
              </div>
              <h3 class="brand-name">MUZIK</h3>
            </div>

            <h4 class="text-center mb-4">{{ isLogin ? 'Welcome Back' : 'Join Our Community' }}</h4>

            <form @submit.prevent="isLogin ? handleLogin() : handleRegister()">
              <div class="mb-4 text-center" v-if="!isLogin">
                <div class="avatar-upload-container">
                  <input type="file" id="avatar-upload" accept="image/*" @change="handleFileChange" class="d-none">
                  <label for="avatar-upload" class="avatar-preview">
                    <div class="avatar-placeholder" v-if="!avatarPreview">
                      <i class="bi bi-person-circle"></i>
                      <div class="avatar-add-icon">
                        <i class="bi bi-plus-circle-fill"></i>
                      </div>
                    </div>
                    <img v-else :src="avatarPreview" alt="Avatar preview" class="avatar-image">
                  </label>
                  <small class="d-block mt-2">Click to add profile picture</small>
                </div>
              </div>

              <!-- Username Field -->
              <div class="mb-3" v-if="!isLogin">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-person"></i></span>
                  <input v-model="username" type="text" class="form-control" placeholder="Username" required>
                </div>
              </div>

              <!-- Email Field -->
              <div class="mb-3">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                  <input v-model="email" type="email" class="form-control" placeholder="Your email" required>
                </div>
              </div>

              <!-- Password Field -->
              <div class="mb-3">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lock"></i></span>
                  <input v-model="password" type="password" class="form-control" placeholder="Password" required>
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 rounded-pill mt-3 auth-btn">
                {{ isLogin ? 'Sign In' : 'Create Account' }}
                <i class="bi bi-arrow-right ms-2"></i>
              </button>

              <div v-if="toast.show" class="toast-notification" :class="toast.type">
                <i :class="toast.icon"></i>
                <span>{{ toast.message }}</span>
                <button @click="toast.show = false" class="toast-close">
                  <i class="bi bi-x"></i>
                </button>
              </div>

              <!-- Toggle Link -->
              <p class="text-center toggle-link">
                {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
                <a href="#" @click.prevent="toggleForm" class="ms-1">
                  {{ isLogin ? 'Sign up' : 'Sign in' }}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
}

.blur-bg {
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: url('https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=2013') center/cover;
  filter: blur(25px) brightness(0.3);
  z-index: 0;
  opacity: 0.8;
}

.auth-card {
  position: relative;
  z-index: 1;
  padding: 2.5rem;
  border-radius: 24px;
  background: rgba(15, 12, 41, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.auth-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 45px rgba(108, 92, 231, 0.25);
}

.music-icon {
  font-size: 3rem;
  color: #8a2be2;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 15px rgba(138, 43, 226, 0.5);
}

.brand-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1.5px;
  margin-bottom: 0;
  font-size: 1.8rem;
  background: linear-gradient(45deg, #8a2be2, #9370db);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.input-group-text {
  background-color: rgba(255, 255, 255, 0.08);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 0 1rem;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  padding: 14px;
  border-radius: 0 8px 8px 0 !important;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-control:focus {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.3);
}

.auth-btn {
  padding: 14px;
  font-weight: 600;
  letter-spacing: 0.8px;
  background: linear-gradient(45deg, #8a2be2, #9370db);
  border: none;
  border-radius: 12px !important;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.auth-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(138, 43, 226, 0.4);
}

.auth-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to bottom right,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0));
  transform: rotate(30deg);
  transition: all 0.5s ease;
}

.auth-btn:hover::after {
  left: 100%;
}

.toggle-link {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.toggle-link a {
  color: #9370db;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.toggle-link a:hover {
  color: #8a2be2;
}

.toggle-link a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #8a2be2;
  transition: width 0.3s ease;
}

.toggle-link a:hover::after {
  width: 100%;
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  border-color: #8a2be2;
  transform: scale(1.05);
}

.avatar-placeholder {
  font-size: 3.5rem;
  color: rgba(255, 255, 255, 0.5);
  position: relative;
}

.avatar-add-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #8a2be2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-add-icon i {
  font-size: 1rem;
  color: white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview:hover .avatar-add-icon {
  background: #6a1bb8;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  max-width: 350px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast-notification.success {
  background: rgba(40, 167, 69, 0.9);
  color: white;
}

.toast-notification.error {
  background: rgba(220, 53, 69, 0.9);
  color: white;
}

.toast-close {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}
</style>
