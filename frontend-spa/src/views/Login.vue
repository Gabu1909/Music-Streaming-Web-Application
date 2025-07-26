<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayer } from '@/store';
import authService from '@/services/auth.service';

const router = useRouter();
const player = usePlayer();
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const adminCode = ref('');
const avatarFile = ref(null);
const username = ref('');
const avatarPreview = ref(null);

const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: 'bi bi-check-circle',
});

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type,
    icon: type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle',
  };
  setTimeout(() => {
    toast.value.show = false;
  }, 5000);
};

const toggleForm = () => {
  isLogin.value = !isLogin.value;
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.match('image.*')) {
      showToast('Vui lòng chọn file ảnh', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 2MB', 'error');
      return;
    }
    avatarFile.value = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      avatarPreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: email.value,
      password: password.value,
      adminCode: adminCode.value
    });

    console.log('Login response in component:', response);

    if (response?.token && response?.user?.user_id) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.user_id);
      await player.login({
        email: email.value,
        password: password.value,
        adminCode: adminCode.value
      });
      console.log('Saved to localStorage:');
      console.log('- Token:', localStorage.getItem('token'));
      console.log('- UserId:', localStorage.getItem('userId'));

      showToast('🎉 Đăng nhập thành công!', 'success');

      setTimeout(() => {
        const role = decodeTokenRole(response.token);
        router.push(role === 'admin' ? '/admin' : '/');
      }, 1500);
    } else {
      showToast(response?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại', 'error');
    }
  } catch (error) {
    console.error('Login error in component:', error);
    showToast(error.response?.data?.message || error.message || 'Đăng nhập thất bại', 'error');
  }
};

const handleRegister = async () => {
  try {
    if (!username.value || !email.value || !password.value) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    if (password.value.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    if (!validateEmail(email.value)) {
      showToast('Email không hợp lệ', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('username', username.value);
    formData.append('email', email.value);
    formData.append('password', password.value);
    if (avatarFile.value) {
      formData.append('avatar_url', avatarFile.value);
    }
    console.log('FormData contents:', [...formData.entries()]);

    const response = await authService.register(formData);
    console.log('Registration response:', response);

   if (response?.status === 'success') {
      showToast('🎉 Đăng ký thành công! Vui lòng đăng nhập', 'success');

      username.value = '';
      email.value = '';
      password.value = '';
      avatarFile.value = null;
      avatarPreview.value = null;

      setTimeout(() => {
        isLogin.value = true;
      }, 3000);
    } else {
      showToast(response?.message || 'Đăng ký không thành công', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast(error.response?.data?.message || error.message || 'Lỗi đăng ký', 'error');
  }
};

function decodeTokenRole(token) {
  return token.includes('admin') ? 'admin' : 'user';
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
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
                  <small class=" d-block mt-2">Click để thêm ảnh đại diện</small>
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


              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary w-100 rounded-pill mt-3 auth-btn">
                {{ isLogin ? 'Sign In' : 'Create Account' }}
                <i class="bi bi-arrow-right ms-2"></i>
              </button>

              <!-- Social Login -->
              <div class="text-center my-4">
                <p class="divider">or continue with</p>
                <div class="social-icons">
                  <button type="button" class="btn btn-outline-light rounded-circle me-2">
                    <i class="bi bi-google"></i>
                  </button>
                  <button type="button" class="btn btn-outline-light rounded-circle me-2">
                    <i class="bi bi-spotify"></i>
                  </button>
                  <button type="button" class="btn btn-outline-light rounded-circle">
                    <i class="bi bi-apple"></i>
                  </button>
                </div>
              </div>
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

.divider {
  color: rgba(255, 255, 255, 0.5);
  position: relative;
  margin: 1.8rem 0;
  font-size: 0.9rem;
}

.social-icons .btn {
  width: 50px;
  height: 50px;
  border-radius: 50% !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  transition: all 0.3s ease;
}

.social-icons .btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.social-icons .btn.bi-google {
  background: linear-gradient(45deg, #4285F4, #34A853, #FBBC05, #EA4335);
}

.social-icons .btn.bi-spotify {
  background: linear-gradient(45deg, #1DB954, #1ED760);
}

.social-icons .btn.bi-apple {
  background: linear-gradient(45deg, #000, #A3AAAE);
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
