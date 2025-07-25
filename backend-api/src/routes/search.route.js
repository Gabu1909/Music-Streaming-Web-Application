const artistService = require('./artistService');
const albumService = require('./albumService');
const playlistService = require('./playlistService');

async function search(query) {
  if (!query) {
    return { artists: [], albums: [], playlists: [] };
  }

  try {
    const [artists, albums, playlists] = await Promise.all([
      artistService.find({ query }),
      albumService.find({ query }),
      playlistService.find({ query })
    ]);

    return {
      artists: artists.data || [],
      albums: albums.data || [],
      playlists: playlists.data || []
    };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to fetch search results');
  }
}

module.exports = {
  search
};