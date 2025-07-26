
import { efetch } from '@/services/efetch';

export default {
  async createArtist(artistData) {
    return await efetch('/api/artists', {
      method: 'POST',
      body: artistData
    });
  },


  async deleteAllArtists() {
    return await efetch('/api/artists', {
      method: 'DELETE'
    });
  },
  async getArtistAlbums(id) {
    return await efetch(`/api/artists/${id}/albums`);
  },

  async getArtistSongs (id) {
    return await  efetch(`/api/artists/${id}/songs`);
  },
  async getAllArtists() {
     return await efetch(`/api/artists`);
  },

  async getArtistDetails(id) {
    return await efetch(`/api/artists/${id}`);
  },

  async updateArtist(id, updateData) {
    return await efetch(`/api/artists/${id}`, {
      method: 'PUT',
      body: updateData
    });
  },

  async deleteArtist(id) {
    return await efetch(`/api/artists/${id}`, {
      method: 'DELETE'
    });
  },


};
