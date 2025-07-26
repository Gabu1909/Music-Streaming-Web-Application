import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import authService from '@/services/auth.service';
import artistService from '@/services/artist.service';

export const usePlayer = defineStore('player', () => {
  const state = reactive({
    currentSong: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
    favorites: [],
  });

  const audioElement = ref(new Audio());
  audioElement.value.volume = state.volume;

  let isPlaySongRunning = false;

  const initAudio = () => {
    console.log('🎧 Initializing audio element');
    audioElement.value.removeEventListener('timeupdate', updateTime);
    audioElement.value.removeEventListener('loadedmetadata', updateMetadata);
    audioElement.value.removeEventListener('ended', playNext);
    audioElement.value.removeEventListener('canplay', handleCanPlay);

    audioElement.value.addEventListener('timeupdate', updateTime);
    audioElement.value.addEventListener('loadedmetadata', updateMetadata);
    audioElement.value.addEventListener('ended', playNext);
    audioElement.value.addEventListener('canplay', handleCanPlay);
  };

  const normalizeSongData = async (song) => {
    console.log('Processing song (raw):', song);
    const actualSong = song.song || song;

    let audioUrl = actualSong.audio_url || actualSong.audioUrl || actualSong.src || actualSong.url;
    if (!audioUrl) {
      console.error('No audio URL found in song:', Object.keys(song));
      return null;
    }

    if (!audioUrl.startsWith('http')) {
      audioUrl = audioUrl.replace(/^public\//, '');
      if (!audioUrl.startsWith('/')) audioUrl = '/' + audioUrl;
      audioUrl = window.location.origin + audioUrl;
    }

    let artistName = song.artist || 'Unknown Artist';
    if (actualSong.artist_id) {
      try {
        const artistDetails = await artistService.getArtistDetails(actualSong.artist_id);
        artistName = artistDetails.data?.artist?.name || artistName;
        console.log('Artist fetched:', artistName);
      } catch (err) {
        console.error('Failed to fetch artist name:', err);
      }
    }

    const cover = actualSong.image_url || actualSong.imageUrl || actualSong.cover || '/uploads/img/default-cover.jpg';
    console.log('Cover URL:', cover);

    return {
      id: actualSong.song_id || actualSong.id || Date.now().toString(),
      title: actualSong.title || 'Unknown Track',
      audioUrl,
      cover,
      artist: artistName,
      album: actualSong.album || '',
      duration: actualSong.duration || 0,
    };
  };

  const verifyAudioUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.status < 400;
    } catch {
      return false;
    }
  };

  const addToPlaylist = async (song) => {
    try {
      state.isLoading = true;
      state.error = null;

      const normalized = await normalizeSongData(song);
      if (!normalized) throw new Error('Failed to normalize song data');

      const isValid = await verifyAudioUrl(normalized.audioUrl);
      if (!isValid) throw new Error(`Audio file not accessible: ${normalized.audioUrl}`);

      state.playlist.push(normalized);
      console.log('Added to playlist:', normalized.title, 'ID:', normalized.id);
    } catch (error) {
      console.error('Add to playlist error:', error);
      state.error = error.message || 'Failed to add song to playlist';
    } finally {
      state.isLoading = false;
    }
  };

  const addToQueue = async (track) => {
    try {
      const normalized = await normalizeSongData(track);
      if (normalized) {
        state.playlist.push(normalized);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to queue:', error);
      state.error = error.message;
      return false;
    }
  };

  const removeFromQueue = (track) => {
    try {
      const trackId = track.song_id || track.id;
      const index = state.playlist.findIndex(item => (item.song_id || item.id) === trackId);

      if (index !== -1) {
        if (state.currentIndex === index) {
          if (state.playlist.length > 1) {
            playNext();
          } else {
            state.currentSong = null;
            state.isPlaying = false;
            audioElement.value.src = '';
          }
        }

        if (state.currentIndex > index) {
          state.currentIndex--;
        }

        state.playlist.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from queue:', error);
      state.error = error.message;
      return false;
    }
  };

  const playSong = async (song, playlist = []) => {
    if (isPlaySongRunning) return;
    isPlaySongRunning = true;

    try {
      state.isLoading = true;
      state.error = null;
      if (!audioElement.value) {
        audioElement.value = new Audio();
        initAudio();
      }

      const normalized = await normalizeSongData(song);
      if (!normalized) throw new Error('Failed to normalize song data');
      const isValid = await verifyAudioUrl(normalized.audioUrl);
      if (!isValid) throw new Error(`Audio file not accessible: ${normalized.audioUrl}`);
      if (playlist?.length > 0) {
        state.playlist = (await Promise.all(playlist.map(s => normalizeSongData(s)))).filter(s => s);
        state.currentIndex = state.playlist.findIndex(s => s.id === normalized.id);
        if (state.currentIndex === -1) state.currentIndex = 0;
      }
      audioElement.value.pause();
      audioElement.value.src = '';
      audioElement.value.src = normalized.audioUrl;
      await audioElement.value.load();
      state.currentSong = normalized;
      state.isPlaying = true;
      await audioElement.value.play();
      console.log('Playing:', normalized.title);
    } catch (error) {
      console.error('Play error:', error);
      state.error = error.message || 'Failed to play song';
      state.isPlaying = false;
      audioElement.value.src = '';
    } finally {
      state.isLoading = false;
      isPlaySongRunning = false;
    }
  };

  const togglePlay = async () => {
    if (!audioElement.value) {
      audioElement.value = new Audio();
      initAudio();
    }
    if (!state.currentSong && state.playlist.length > 0) {
      return playSong(state.playlist[0]);
    }
    if (!state.currentSong) {
      console.warn('Cannot toggle: no current song loaded');
      state.error = 'No song selected';
      return;
    }

    try {
      if (state.isPlaying) {
        await audioElement.value.pause();
        state.isPlaying = false;
      } else {
        if (!audioElement.value.src) {
          audioElement.value.src = state.currentSong.audioUrl;
          await audioElement.value.load();
        }
        await audioElement.value.play();
        state.isPlaying = true;
      }
    } catch (error) {
      console.error('Toggle error:', error);
      state.error = error.message;
      state.isPlaying = false;
    }
  };

  const playNext = () => {
    if (state.playlist.length === 0 || !audioElement.value) return;
    const nextIndex = (state.currentIndex + 1) % state.playlist.length;
    state.currentIndex = nextIndex;
    playSong(state.playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (state.playlist.length === 0 || !audioElement.value) return;
    const prevIndex = state.currentIndex === 0 ? state.playlist.length - 1 : state.currentIndex - 1;
    state.currentIndex = prevIndex;
    playSong(state.playlist[prevIndex]);
  };

  const updateTime = () => {
    if (audioElement.value) state.currentTime = audioElement.value.currentTime;
  };

  const updateMetadata = () => {
    if (audioElement.value) state.duration = audioElement.value.duration || 0;
  };

  const removeFromPlaylist = (index) => {
    if (state.playlist[index]) {
      state.playlist.splice(index, 1);
      if (state.currentIndex >= index && state.currentIndex > 0) {
        state.currentIndex--;
      }
      if (state.currentIndex >= state.playlist.length) {
        state.currentIndex = state.playlist.length - 1;
      }
      if (state.playlist.length === 0) {
        state.currentSong = null;
        state.isPlaying = false;
        audioElement.value.src = '';
      }
    }
  };

  const handleCanPlay = () => {
    console.log('Audio can play');
    state.isLoading = false;
  };

  const setVolume = (volume) => {
    state.volume = Math.max(0, Math.min(1, volume));
    if (audioElement.value) audioElement.value.volume = state.volume;
  };

  const seek = (time) => {
    if (audioElement.value && state.duration) {
      const seekTime = Math.max(0, Math.min(state.duration, time));
      audioElement.value.currentTime = seekTime;
      state.currentTime = seekTime;
    }
  };

  const addToFavorites = async (songId, userId) => {
    if (!userId) throw new Error('User not logged in');
    try {
      const response = await authService.addFavorite(userId, songId);
      if (response.status === 'success') {
        const song = state.playlist.find(s => s.id === songId) || {
          id: songId,
          title: 'Unknown',
          cover: '/default-cover.jpg',
          artist: 'Unknown',
        };
        state.favorites.push({ id: response.data.id, songId: song.id, ...song });
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      state.error = error.message || 'Failed to add to favorites';
    }
  };

  const removeFromFavorites = async (songId, userId) => {
    if (!userId) throw new Error('User not logged in');
    try {
      const favorite = state.favorites.find(f => f.songId === songId);
      if (favorite) {
        await authService.removeFavorite(userId, songId);
        state.favorites = state.favorites.filter(f => f.songId !== songId);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      state.error = error.message || 'Failed to remove from favorites';
    }
  };

  const loadFavorites = async (userId) => {
    if (!userId) throw new Error('User not logged in');
    try {
      const response = await authService.getFavorites(userId);
      let favoritesData = [];

      if (Array.isArray(response)) {
        favoritesData = response;
      } else if (response.status === 'success' && Array.isArray(response.data)) {
        favoritesData = response.data;
      } else {
        throw new Error('Invalid data from server');
      }

      state.favorites = await Promise.all(favoritesData.map(async (fav) => {
        const normalized = await normalizeSongData(fav);
        return {
          id: fav.id || normalized.id,
          songId: fav.song_id || normalized.id,
          ...normalized,
        };
      }));

      console.log('Loaded favorites:', state.favorites);
      return { data: state.favorites };
    } catch (error) {
      console.error('Error loading favorites:', error);
      state.error = error.message || 'Failed to load favorites';
      return { data: [] };
    }
  };

  initAudio();

  return {
    state,
    currentTrack: computed(() => state.currentSong),
    playlist: computed(() => state.playlist || []),
    isPlaying: computed(() => state.isPlaying),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    currentTime: computed(() => state.currentTime),
    duration: computed(() => state.duration),
    volume: computed(() => state.volume),
    favorites: computed(() => state.favorites),
    initAudio,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    seek,
    addToFavorites,
    removeFromFavorites,
    loadFavorites,
    removeFromPlaylist,
    addToPlaylist,
    addToQueue,
    removeFromQueue,
    normalizeSongData,
  };
});
