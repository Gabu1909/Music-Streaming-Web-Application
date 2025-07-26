import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth.service';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userId = ref(localStorage.getItem('userId') || null);
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
    email.value = '';
    password.value = '';
    adminCode.value = '';
    username.value = '';
    avatarFile.value = null;
    avatarPreview.value = null;
  };

  const logout = async () => {
    try {
      await authService.logout?.();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      userId.value = null;
      queryClient.removeQueries();
      router.push('/login');
      showToast('You have been logged out.', 'success');
    } catch (error) {
      showToast('Logout failed', 'error');
      console.error('Logout failed:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image must not exceed 2MB', 'error');
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const decodeTokenRole = (token) => {
    return token.includes('admin') ? 'admin' : 'user';
  };

  const loginMutation = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (response) => {
      if (response?.token && response?.user?.user_id) {
        localStorage.setItem('token', response.token);
        userId.value = response.user.user_id;
        localStorage.setItem('userId', userId.value);
        showToast('🎉 Login successful!', 'success');
        queryClient.invalidateQueries(['user']);
        setTimeout(() => {
          const role = decodeTokenRole(response.token);
          router.push(role === 'admin' ? '/admin' : '/');
        }, 1500);
      } else {
        showToast(response?.message || 'Login failed. Please try again', 'error');
      }
    },
    onError: (error) => {
      showToast(error.response?.data?.message || error.message || 'Login failed', 'error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (formData) => authService.register(formData),
    onSuccess: (response) => {
      if (response?.status === 'success') {
        showToast('🎉 Registration successful! Please login', 'success');
        username.value = '';
        email.value = '';
        password.value = '';
        avatarFile.value = null;
        avatarPreview.value = null;
        setTimeout(() => {
          isLogin.value = true;
        }, 3000);
      } else {
        showToast(response?.message || 'Registration failed', 'error');
      }
    },
    onError: (error) => {
      showToast(error.response?.data?.message || error.message || 'Registration error', 'error');
    },
  });

  const handleLogin = () => {
    if (!email.value || !password.value) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    loginMutation.mutate({
      email: email.value,
      password: password.value,
      adminCode: adminCode.value,
    });
  };

  const handleRegister = () => {
    if (!username.value || !email.value || !password.value) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (password.value.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (!validateEmail(email.value)) {
      showToast('Invalid email format', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('username', username.value);
    formData.append('email', email.value);
    formData.append('password', password.value);
    if (avatarFile.value) {
      formData.append('avatar_url', avatarFile.value);
    }

    registerMutation.mutate(formData);
  };

  return {
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
    logout,
    loginMutation,
    registerMutation,
    userId,
    showToast,
    validateEmail,
  };
}
