import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import artistService from '@/services/artist.service';

export function useArtist(artistId) {
  const { data: artistData, isLoading, error, refetch } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const response = await artistService.getArtistDetails(artistId);
      return response.data?.artist || {};
    },
    onError: (err) => {
      console.error('Failed to fetch artist details:', err);
    },
  });

  const { data: artistSongsData } = useQuery({
    queryKey: ['artistSongs', artistId],
    queryFn: async () => {
      const response = await artistService.getArtistSongs(artistId);
      const songs = response.data?.songs || [];
      return songs.map(song => ({
        ...song,
        id: song.song_id || song.id || `${artistId}-${song.title}`,
        artist: song.artist || artistData.value?.name || 'Unknown Artist',
        audio_url: song.audio_url || '',
      }));
    },
    onError: (err) => {
      console.error('Failed to fetch artist songs:', err);
    },
  });

  const { data: artistAlbumsData } = useQuery({
    queryKey: ['artistAlbums', artistId],
    queryFn: async () => {
      const response = await artistService.getAlbumsByArtist(artistId);
      return response.data?.albums || [];
    },
    onError: (err) => {
      console.error('Failed to fetch artist albums:', err);
    },
  });

  return {
    artist: computed(() => artistData.value || {}),
    artistSongs: computed(() => artistSongsData.value || []),
    artistAlbums: computed(() => artistAlbumsData.value || []),
    isLoading,
    error,
    refetch,
  };
}
