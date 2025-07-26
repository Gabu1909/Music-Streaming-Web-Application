import { efetch } from '@/services/efetch';

export default {
  async login(credentials) {
    return await efetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async register(formData) {
    return await efetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    });
  },

  async getUser() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token) throw new Error('No token found');

    return await efetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return Promise.resolve();
  },

  async addFavorite(userId, songId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    return await efetch(`/api/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ song_id: songId }),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  async removeFavorite(userId, songId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    return await efetch(`/api/users/${userId}/favorites`, {
      method: 'DELETE',
      body: JSON.stringify({ song_id: songId }),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  async getFavorites(userId) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not logged in');

    return await efetch(`/api/users/${userId}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  async updateProfile(userId, formData) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    return await efetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,

      },
    });
  }
}


