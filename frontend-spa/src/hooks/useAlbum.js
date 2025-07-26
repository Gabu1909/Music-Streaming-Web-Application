import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import albumService from '@/services/album.service';
import artistService from '@/services/artist.service';
import { playlistService } from '@/services/playlist.service';

export function useAlbums(sortOption, searchQuery) {


  const { data: albums, isLoading, error, refetch } = useQuery({
    queryKey: ['albums', sortOption, searchQuery],
    queryFn: async () => {
      const response = await albumService.getAllAlbums();
      console.log('API response for albums:', response);
      const albumsData = response.data?.albums || response.albums || [];
      if (!albumsData.length) {
        throw new Error('Album database empty');
      }
      return await Promise.all(
        albumsData.map(async (album) => {
          let coverUrl =
            album.cover_url ||
            album.image_url ||
            album.thumbnail ||
            album.cover ||
            '';

          if (coverUrl) {
            if (!coverUrl.startsWith('http') && !coverUrl.startsWith('/')) {
              coverUrl = `/uploads/img/${coverUrl.replace(/^public\/[uU]ploads\/img\//i, '')}`;
            } else if (coverUrl.startsWith('public/')) {
              coverUrl = coverUrl.replace(/^public/, '');
            } else if (!coverUrl.startsWith('/uploads/')) {
              coverUrl = `/uploads/img/${coverUrl.split('/').pop()}`;
            }
          } else {
            if (album.artist_id) {
              try {
                const artistResponse = await artistService.getArtistDetails(album.artist_id);
                const artistData = artistResponse.data?.artist || artistResponse.data;
                coverUrl = artistData?.avatar_url || artistData?.image_url || '';
              } catch (err) {
                console.warn(`Failed to fetch artist avatar for album ${album.title}:`, err);
              }
            }

            if (!coverUrl && album.playlist_id) {
              try {
                const playlistResponse = await playlistService.getPlaylistDetails(album.playlist_id);
                const playlistData = playlistResponse.data?.playlist || playlistResponse.data;
                coverUrl = playlistData?.cover_url || playlistData?.image_url || '';
              } catch (err) {
                console.warn(`Failed to fetch playlist cover for album ${album.title}:`, err);
              }
            }

            if (!coverUrl) {
              try {
                const songsResponse = await albumService.getAlbumSongs(album.album_id || album.id);
                const songsData = songsResponse?.data?.songs || songsResponse.songs || [];
                if (songsData.length) {
                  coverUrl =
                    songsData[0].cover_url ||
                    songsData[0].image_url ||
                    songsData[0].thumbnail ||
                    '';
                }
              } catch (err) {
                console.warn(`Failed to fetch song cover for album ${album.title}:`, err);
              }
            }

            coverUrl = coverUrl || '/Uploads/img/default-cover.jpg';
          }

          // Ensure album_id is a string
          const albumId = album.album_id != null ? String(album.album_id) : album.id != null ? String(album.id) : null;
          if (!albumId) {
            console.warn(`No valid album_id for album ${album.title}, skipping navigation`);
            return null;
          }

          console.log(`Processed album ${album.title}:`, {
            album_id: albumId,
            cover_url: coverUrl,
          });

          return {
            ...album,
            id: albumId,
            album_id: albumId,
            artist_name: album.artist_name || 'Unknown Artist',
            cover_url: coverUrl,
            title: album.title || 'Untitled Album',
            description: album.description || '',
          };
        })
      ).then((results) => results.filter((album) => album !== null));
    },
  });

  const newAlbums = computed(() => {
    return albums.value
      ? [...albums.value]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 6)
      : [];
  });

  const topAlbums = computed(() => {
    return albums.value
      ? [...albums.value]
          .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
          .slice(0, 6)
      : [];
  });

  const sortedAlbums = computed(() => {
    if (!albums.value) return [];
    let result = [...albums.value];

    if (searchQuery?.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (album) =>
          album.title.toLowerCase().includes(query) ||
          (album.artist_name && album.artist_name.toLowerCase().includes(query))
      );
    }

    switch (sortOption?.value) {
      case 'title-asc':
        return result.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return result.sort((a, b) => b.title.localeCompare(a.title));
      case 'recent':
      default:
        return result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
  });

  return {
    albums: sortedAlbums,
    newAlbums,
    topAlbums,
    isLoading,
    error,
    refetch,
  };
}
