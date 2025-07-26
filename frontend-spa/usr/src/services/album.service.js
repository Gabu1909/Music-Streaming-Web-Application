
import { efetch } from '@/services/efetch';

const albumService = {
  async getAllAlbums() {
    return await efetch('/api/albums', { method: 'GET' });
  },

  async getAlbumDetails(id) {
    return await efetch(`/api/albums/${id}`, { method: 'GET' });
  },

  async getAlbumSongs(id) {
    return await efetch(`/api/albums/${id}/songs`, { method: 'GET' });
  },

  async createAlbum(data) {
    return await efetch('/api/albums', { method: 'POST', body: data });
  },

  async updateAlbum(id, data) {
    return await efetch(`/api/albums/${id}`, { method: 'PUT', body: data });
  },

  async deleteAlbum(id) {
    return await efetch(`/api/albums/${id}`, { method: 'DELETE' });
  },

  async getAlbumsByArtist(artistId) {
    return await efetch(`/api/artists/${artistId}/albums`, { method: 'GET' });
  },
};

export default albumService;
