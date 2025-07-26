import { useQuery } from '@tanstack/vue-query';
import { playlistService } from '@/services/playlist.service';
import { usePlayer } from '@/store/index';


export function usePlaylist(playlistId) {
  const player = usePlayer();
  const defaultImage = 'uploads/img/default-playlist.png';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      if (!playlistId || isNaN(playlistId)) {
        throw new Error('Invalid playlist ID');
      }

      const response = await playlistService.getPlaylistDetails(playlistId);

      if (!response || response.status === 'fail') {
        throw new Error(response?.message || 'Playlist not found');
      }

      const playlistData = response.data?.data || response.data || response;

      if (!playlistData || typeof playlistData !== 'object') {
        throw new Error('Invalid playlist data');
      }

      const normalizedSongs = await Promise.all(
        (playlistData.songs || []).map(async (song) => {
          const normalized = await player.normalizeSongData(song);
          return normalized;
        })
      );

      return {
        ...playlistData,
        id: playlistData.playlist_id || playlistData.id,
        song_count: playlistData.song_count || playlistData.songs?.length || 0,
        image: playlistData.image_url || defaultImage,
        songs: normalizedSongs.filter((song) => song),
      };
    },
    enabled: !!playlistId,
  });

  return {
    playlist: data,
    isLoading,
    error,
    refetch,
  };
}
