import { efetch } from './efetch.js';

const SongService = {

  async getSongs() {
    return await efetch('/api/songs');
  },

  async getSongById(id) {
    return await efetch(`/api/songs/${id}`);
  },

  async createSong(data) {
    return await efetch('/api/songs', {
      method: 'POST',
      body: data
    });
  },

  async updateSong(id, data) {
    return await efetch(`/api/songs/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  async deleteSong(id) {
    return await efetch(`/api/songs/${id}`, {
      method: 'DELETE'
    });
  },

  async getSongsByArtist(artistId) {
    return await efetch(`/api/artists/${artistId}/songs`);
  }
};

export default SongService;
