const artistService = require('./artists.service');
const albumService = require('./albums.service');
const playlistService = require('./playlist.service');
const songService = require('./songs.service');

async function search(query) {
  if (!query) {
    return { artists: [], albums: [], playlists: [], songs:[] };
  }

  try {
    const [artists, albums, playlists, songs] = await Promise.all([
      artistService.find({ query }).catch(err => {
        console.error('artistService.find error:', err);
        return { data: [] }; 
      }),
      albumService.find({ query }).catch(err => {
        console.error('albumService.find error:', err);
        return { data: [] };
      }),
      playlistService.find({ query }).catch(err => {
        console.error('playlistService.find error:', err);
        return { data: [] };
      }),
      songService.find({ query }).catch(err => {
        console.error('songService.find error:', err);
        return { data: [] };
      })
    ]);

    return {
      artists: artists?.data || [],
      albums: albums?.data || [],
      playlists: playlists?.data || [],
      songs: songs?.data || []
    };
  } catch (error) {
    console.error('Search error:', error.message, error.stack);
    throw new Error(`Failed to fetch search results: ${error.message}`);
  }
}
module.exports = {
  search
};