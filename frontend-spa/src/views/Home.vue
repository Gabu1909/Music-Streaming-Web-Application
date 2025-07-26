<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePlayer } from '@/store/index';
import bannerImage from '/public/uploads/img/banner.jpg';
import HomeBanner from '@/components/HomeBanner.vue';
import SectionContainer from '@/components/SectionContainer.vue';
import SongCard from '@/components/common/SongCard.vue';
import PlaylistCard from '@/components/common/PlaylistCard.vue';
import AlbumCard from '@/components/common/AlbumCard.vue';
import songService from '@/services/song.service';

const player = usePlayer();

const songs = ref([]);
const suggestedSongs = ref([]);
const newReleases = ref([]);
const recentSongs = ref([]);
const personalizedSongs = ref([]);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('all');


const currentlyPlayingId = computed(() => player.state.currentSong?.id);

const fetchSongs = async () => {
  try {
    loading.value = true;
    const response = await songService.getSongs();
    songs.value = response.data?.songs || response.songs || [];
    console.log('Fetched songs:', songs.value);
    processSongs();
  } catch (err) {
    console.error('Error fetching songs:', err);
    error.value = 'Không thể tải dữ liệu bài hát';
  } finally {
    loading.value = false;
  }
};

const processSongs = () => {
  if (!Array.isArray(songs.value) || !songs.value.length) return;

  const shuffledSongs = [...songs.value].sort(() => Math.random() - 0.5);
  suggestedSongs.value = shuffledSongs.slice(0, 8);

  const sortedByDate = [...songs.value].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || a.updated_at || 0);
    const dateB = new Date(b.createdAt || b.created_at || b.updated_at || 0);
    return dateB - dateA;
  });

  let filteredReleases = sortedByDate;
  if (activeTab.value === 'vietnam') {
    filteredReleases = sortedByDate.filter(song =>
      isVietnameseSong(song.title) || isVietnameseSong(getArtistName(song))
    );
  } else if (activeTab.value === 'international') {
    filteredReleases = sortedByDate.filter(song =>
      !isVietnameseSong(song.title) && !isVietnameseSong(getArtistName(song))
    );
  }

  newReleases.value = filteredReleases.slice(0, 6);
  recentSongs.value = shuffledSongs.slice(8, 14);
  personalizedSongs.value = shuffledSongs.slice(14, 20);
};

const isVietnameseSong = (text) => {
  if (!text) return false;
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnameseChars.test(text);
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
  processSongs();
};

const formatDuration = (duration) => {
  if (!duration) return '0:00';
  if (typeof duration === 'string' && duration.includes(':')) return duration;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getSongImage = (song) => {
  if (!song) return null;
  if (song.image_url) return song.image_url;
  if (song.thumbnail) return song.thumbnail;

  if (song.album && song.album.cover_url) return song.album.cover_url;

  if (song.artist) {
    if (song.artist.avatar_url) return song.artist.avatar_url;
    if (song.artist.image_url) return song.artist.image_url;
  }

  return '/uploads/img/default-cover.jpg';
};

const getArtistName = (song) => {
  if (Array.isArray(song.artists) && song.artists.length > 0) {
    return song.artists.map(a => a.name || 'Unknown').join(', ');
  }
  if (typeof song.artist === 'string') return song.artist;
  if (song.artist && song.artist.name) return song.artist.name;
  return 'Unknown Artist';
};

const handlePlaySong = async (song) => {
  try {
    const songId = song.song_id || song.id;
    if (player.currentTrack?.id === songId) {
      return player.togglePlay();
    }
    const normalizedSong = await player.normalizeSongData({
      ...song,
      artist: typeof song.artist === 'string' ? song.artist : song.artists?.map(a => a.name).join(', ')
    });
    const playlist = (
      await Promise.all(
        songs.value.map(s =>
          player.normalizeSongData({
            ...s,
            artist: typeof s.artist === 'string' ? s.artist : s.artists?.map(a => a.name).join(', ')
          })
        )
      )
    ).filter(Boolean);


    await player.playSong(normalizedSong, playlist);
  } catch (err) {
    console.error('Error playing song:', err);
  }
};

const isCurrentlyPlaying = (song) => {
  const songId = song.id || song._id;
  return currentlyPlayingId.value === songId && player.state.isPlaying;
};
onMounted(() => {
  fetchSongs();
});
</script>
<template>
  <div class="home-view">
    <HomeBanner title="Chào mừng trở lại" subtitle="Hàng ngàn bài hát đang chờ bạn khám phá" :background="bannerImage"
      gradient="linear-gradient(to right, #6a11cb, #2575fc)" />

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2">Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger mx-3" role="alert">
      {{ error }}
      <button @click="fetchSongs" class="btn btn-outline-danger btn-sm ms-2">
        Thử lại
      </button>
    </div>

    <div v-else>
      <SectionContainer title="TOP SONGS OF WEEK" v-if="suggestedSongs.length > 0">
        <div class="row">
          <div v-for="song in suggestedSongs" :key="song.id || song._id" class="col-lg-3 col-md-4 col-6 mb-4">
            <SongCard :title="song.title || song.name" :artist="getArtistName(song)" :image_url="getSongImage(song)"
              :duration="formatDuration(song.duration)" :song-data="song"
              :is-playing="currentlyPlayingId === (song.id || song._id) && player.state.isPlaying"
              @play="handlePlaySong(song)" />
          </div>
        </div>
      </SectionContainer>


      <SectionContainer title="NEW RELEASE" v-if="newReleases.length > 0">
        <div class="release-tabs mb-4">
          <button :class="['tab', { active: activeTab === 'all' }]" @click="handleTabChange('all')">
            Tất Cả
          </button>
          <button :class="['tab', { active: activeTab === 'vietnam' }]" @click="handleTabChange('vietnam')">
            Việt Nam
          </button>
          <button :class="['tab', { active: activeTab === 'international' }]" @click="handleTabChange('international')">
            Quốc Tế
          </button>
        </div>

        <div class="row">
          <div v-for="(song, index) in newReleases" :key="song.id || song._id" class="col-md-2 col-6 mb-3">
            <AlbumCard :title="song.title || song.name" :artist="getArtistName(song)" :cover_url="getSongImage(song)"
              :badge="index < 3 ? 'Mới' : 'Hot'" :song-data="song"
              :is-playing="currentlyPlayingId === (song.id || song._id) && player.state.isPlaying"
              @play="handlePlaySong(song)" />
          </div>
        </div>
      </SectionContainer>



      <!-- Personalized Section -->
      <SectionContainer title="FOR YOU FOR TODAY" v-if="personalizedSongs.length > 0">
        <div class="row">
          <div v-for="song in personalizedSongs" :key="song.id || song._id" class="col-md-2 col-6 mb-3">
            <AlbumCard :title="song.title || song.name" :artist="getArtistName(song)" :cover_url="getSongImage(song)"
              :song-data="song" :is-playing="currentlyPlayingId === (song.id || song._id) && player.state.isPlaying"
              @play="handlePlaySong(song)" />
          </div>
        </div>
      </SectionContainer>

      <!-- Empty State -->
      <div v-if="songs.length === 0" class="text-center py-5">
        <i class="bi bi-music-note-list" style="font-size: 4rem; color: #ccc;"></i>
        <h4 class="mt-3 text-muted">Chưa có bài hát nào</h4>
        <p class="text-muted">Hãy thêm một số bài hát vào thư viện của bạn</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.release-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  background: transparent;
  color: #666;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.tab.active {
  color: #2575fc;
  border-color: #2575fc;
  background: rgba(37, 117, 252, 0.1);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.home-view {
  min-height: 100vh;
}

@media (max-width: 768px) {
  .release-tabs {
    justify-content: center;
    flex-wrap: wrap;
  }

  .tab {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
