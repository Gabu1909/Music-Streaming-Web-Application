import { efetch } from '@/services/efetch';

const playlistService = {
  async getAllPlaylists() {
    return await efetch('/api/playlists', { method: 'GET' });
  },

  async getPlaylistDetails(playlistId) {
    return await efetch(`/api/playlists/${playlistId}`, { method: 'GET' });
  },

  async createPlaylist(data) {
    return await efetch('/api/playlists', { method: 'POST', body: data,headers: {} });
  },

  async updatePlaylist(playlistId, data) {
    return await efetch(`/api/playlists/${playlistId}`, { method: 'PUT', body: data });
  },

  async deletePlaylist(playlistId) {
    return await efetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
  },


};

export { playlistService };
