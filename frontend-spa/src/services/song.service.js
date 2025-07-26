
import { efetch } from './efetch.js';

const SongService = {
  async getSongs() {
    try {
      const url = `/api/songs`;
      const response = await efetch(url, { method: 'GET' });
      return response.data || response;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  },

  async getSongById(id) {
    try {
      const response = await efetch(`/songs/${id}`, { method: 'GET' });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching song with ID ${id}:`, error);
      throw error;
    }
  },

  async getSongsByArtist(artistId) {
    try {
      const response = await efetch(`/api/artists/${artistId}/songs`, { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      throw error;
    }
  },

  async getSongDetails(songId) {
    try {
      const response = await efetch(`/api/songs/${songId}`, { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Error fetching song details:', error);
      throw error;
    }
  },

  async updateSong(id, data) {
    try {
      const response = await efetch(`/songs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data || response;
    } catch (error) {
      console.error(`Error updating song with ID ${id}:`, error);
      throw error;
    }
  },
};

export default SongService;
