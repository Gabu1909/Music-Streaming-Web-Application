<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Create New Playlist</h2>
      <input v-model="playlistName" placeholder="Enter playlist name" class="modal-input" />
      <!-- File input for cover image -->
      <div class="cover-upload">
        <label for="cover-upload" class="cover-label">Upload Cover Image</label>
        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          @change="handleFileUpload"
          class="modal-input"
        />
        <p v-if="file" class="cover-preview">{{ file.name }}</p>
      </div>

      <!-- Song Selection -->
      <div class="song-selection">
        <h3>Select Songs</h3>
        <p class="song-count" v-if="songs?.length">{{ songs.length }} songs available</p>
        <p class="song-count" v-else>No songs available</p>
        <div class="song-search">
          <input v-model="songSearch" placeholder="Search songs..." class="modal-input" />
        </div>
        <div class="song-list">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <span>Loading songs...</span>
          </div>
          <div v-else-if="fetchError" class="error-message">
            <span>{{ fetchError.message || 'Failed to load songs. Please try again.' }}</span>
          </div>
          <div v-else-if="filteredSongs.length === 0" class="no-songs">
            <span>No songs found</span>
          </div>
          <div v-else class="song-list-items">
            <label v-for="song in filteredSongs" :key="song.id" class="song-item">
              <input type="checkbox" v-model="selectedSongs" :value="song.id" />
              <span>{{ song.title }} - {{ song.artist }}</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="mutationError" class="error-message">
        <span>{{ mutationError }}</span>
      </div>

      <div class="modal-actions">
        <button @click="createPlaylist" class="modal-save-btn" :disabled="isCreating">
          {{ isCreating ? 'Saving...' : 'Save' }}
        </button>
        <button @click="$emit('close')" class="modal-cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuery, useMutation } from '@tanstack/vue-query';
import { usePlayer } from '@/store';
import SongService from '@/services/song.service';
import { playlistService } from '@/services/playlist.service';

const emit = defineEmits(['close', 'create']);

const playerStore = usePlayer();
const playlistName = ref('');
const songSearch = ref('');
const selectedSongs = ref([]);
const file = ref(null);
const mutationError = ref(null);

const { data: songs, isLoading, error: fetchError } = useQuery({
  queryKey: ['songs'],
  queryFn: async () => {
    console.log('Fetching songs from /api/songs...');
    const response = await SongService.getSongs();
    console.log('Raw API response:', response);

    let songList = [];
    if (Array.isArray(response)) {
      songList = response;
    } else if (response.status === 'success' && Array.isArray(response.data)) {
      songList = response.data;
    } else if (response.status === 'success' && Array.isArray(response.data.songs)) {
      songList = response.data.songs;
    } else if (response.songs && Array.isArray(response.songs)) {
      songList = response.songs;
    } else {
      console.log('Unexpected response type:', typeof response, 'Response:', response);
      throw new Error('Invalid response format: Expected song data');
    }

    return songList
      .filter(song => song.song_id && song.title)
      .map(song => ({
        id: song.song_id,
        title: song.title || 'Unknown Title',
        artist: song.artists && song.artists.length > 0 ? song.artists[0].name : 'Unknown Artist',
      }));
  },
  onError: (err) => {
    console.error('Error fetching songs:', err);
  },
});

const filteredSongs = computed(() => {
  console.log('Filtering songs, search:', songSearch.value, 'total songs:', songs.value?.length || 0);
  if (!songSearch.value) return songs.value || [];
  return (songs.value || []).filter(song =>
    song.title.toLowerCase().includes(songSearch.value.toLowerCase()) ||
    song.artist.toLowerCase().includes(songSearch.value.toLowerCase())
  );
});

const { mutate: createPlaylist, isLoading: isCreating } = useMutation({
  mutationFn: async () => {
    if (!playlistName.value?.trim()) {
      throw new Error('Please enter a playlist name.');
    }
    if (selectedSongs.value.length === 0) {
      throw new Error('Please select at least one song.');
    }
    if (!file.value) {
      throw new Error('Please upload a cover image.');
    }
    if (!playerStore.userId) {
      throw new Error('No authenticated user found. Please log in.');
    }


    const formData = new FormData();
    formData.append('file', file.value);
    // Create JSON payload
    const payload = {
      name: playlistName.value.trim(),
      song_ids: selectedSongs.value, // Send as array
      user_id: playerStore.userId.toString(),
      is_public: true,
      is_system: true,
      cover_url: coverUrl,
    };

    console.log('Creating playlist with JSON:', payload);

    if (!selectedSongs.value.every(id => typeof id === 'number')) {
      console.error('Invalid song_ids:', selectedSongs.value);
      throw new Error('Invalid song selection. Please try again.');
    }

    const response = await playlistService.createPlaylist(payload);
    if (!response.data) {
      throw new Error('Invalid response from server: No data returned.');
    }
    return response.data;
  },
  onSuccess: (data) => {
    console.log('Playlist creation successful:', data);
    emit('create', data);
    playlistName.value = '';
    selectedSongs.value = [];
    file.value = null;
    mutationError.value = null;
  },
  onError: (err) => {
    let errorMessage = err.message;
    if (err.message.includes('HTTP error')) {
      try {
        const errorBody = JSON.parse(err.message.match(/body: ({.*})/)[1]);
        errorMessage = errorBody.message || 'Failed to create playlist. Please try again.';
      } catch {
        errorMessage = 'Failed to create playlist. Invalid server response.';
      }
    }
    mutationError.value = errorMessage;
    console.error('Error creating playlist:', err);
  },
});

const handleFileUpload = (event) => {
  const uploadedFile = event.target.files[0];
  if (uploadedFile && uploadedFile.type.startsWith('image/') && uploadedFile.size < 5 * 1024 * 1024) {
    file.value = uploadedFile;
    mutationError.value = null;
  } else {
    file.value = null;
    mutationError.value = 'Please upload a valid image file under 5MB.';
  }
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  animation: fadeIn 0.3s ease-out;
}


.modal-content {
  background: linear-gradient(135deg, #805379, #3b0d84);
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 550px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 12px 32px rgba(0, 0, 50, 0.3);
  font-family: 'Inter', sans-serif;
  color:white;
  animation: slideUp 0.3s ease-out;
}

/* Headings */
h2, h3 {
  color: #fefeff;
  font-weight: 700;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.8rem;
}

h3 {
  font-size: 1.3rem;
}

.song-count {
  color: #f6f6ff;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.cover-upload {
  margin: 1rem 0;
}

.cover-label {
  display: block;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.cover-preview {
  color: #ffffff;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Input fields */
.modal-input {
  width: 100%;
  padding: 0.9rem;
  margin: 0.75rem 0 1.25rem;
  border: 1px solid #b0b0cc;
  border-radius: 10px;
  background: #ffffff;
  color: #10105f;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.modal-input::placeholder {
  color: #7a7a9a;
}

.modal-input:focus {
  outline: none;
  border-color: #570e69;
  box-shadow: 0 0 8px rgba(142, 142, 239, 0.3);
}

.modal-input[type="file"] {
  padding: 0.5rem;
}

.song-selection {
  margin: 1.5rem 0;
}

.song-search {
  margin-bottom: 1.25rem;
}

.song-list {
  max-height: 320px;
  overflow-y: auto;
  background: #f0f0ff;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #d0d0e6;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  transition: background 0.2s, transform 0.2s;
  cursor: pointer;
}

.song-item:hover {
  background: #e6e6ff;
  transform: translateY(-2px);
}

.song-item input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #7c0ec0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  position: relative;
}

.song-item input[type="checkbox"]:checked {
  background: #3a0375;
  border-color: #8e8eef;
}

.song-item input[type="checkbox"]:checked::after {
  content: '✔';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 14px;
}

.song-item span {
  color: #2a2a3d;
  font-size: 1rem;
  font-weight: 500;
}

.no-songs {
  text-align: center;
  color: #7a7a9a;
  font-size: 1rem;
  padding: 1.5rem;
}

.error-message {
  color: #ff4d4f;
  text-align: center;
  margin: 1rem 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.modal-save-btn, .modal-cancel-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.modal-save-btn {
  background: linear-gradient(90deg, #101079, #460170);
  color: #ffffff;
}

.modal-save-btn:hover {
  background: linear-gradient(90deg, #5e0171, #d506d5);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(142, 142, 239, 0.4);
}

.modal-cancel-btn {
  background: #e0e0f0;
  color: #2a2a3d;
}

.modal-cancel-btn:hover {
  background: #d0d0e6;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 50, 0.2);
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #7a7a9a;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(142, 142, 239, 0.2);
  border-top-color: #8e8eef;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```
