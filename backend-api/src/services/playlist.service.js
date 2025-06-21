const knex = require("../database/knex");
const ApiError = require("../../api-error");

function getCoverUrl(file) {
  return `public/uploads/images/${file.filename}`;
}

async function createPlaylistWithSongs(
  { name, user_id, is_public = false, is_system = false, song_ids },
  coverFile
) {
  if (!is_system && !user_id) {
    throw new ApiError(400, "user_id is required for user playlists");
  }

  const songs = await knex("songs").whereIn("song_id", song_ids);
  if (songs.length === 0) {
    throw new ApiError(404, "No songs found with the given song_ids");
  }

  const [playlist] = await knex("playlists")
    .insert({
      name,
      user_id: is_system ? null : user_id,
      is_public,
      is_system,
      image_url: coverFile ? getCoverUrl(coverFile) : null,
    })
    .returning([
      "playlist_id",
      "name",
      "user_id",
      "is_public",
      "is_system",
      "image_url",
    ]);

  const playlistSongsData = songs.map((song) => ({
    playlist_id: playlist.playlist_id,
    song_id: song.song_id,
  }));

  await knex("playlistsongs").insert(playlistSongsData);

  return {
    ...playlist,
    songs: songs.map((s) => ({ song_id: s.song_id, title: s.title })),
  };
}

async function getAllPlaylists() {
  return await knex("playlists").select("*");
}

async function deleteAllPlaylists() {
  await knex("playlistsongs").del();
  await knex("playlists").del();
}

async function updatePlaylist(id, data, coverFile) {
  const old = await knex("playlists").where({ playlist_id: id }).first();
  if (!old) throw new ApiError(404, "Playlist not found");

  const {
    name = old.name,
    user_id = old.user_id,
    is_public = old.is_public,
    is_system = old.is_system,
    song_ids,
  } = data;

  const updateData = {
    name,
    user_id,
    is_public,
    is_system,
    image_url: coverFile ? getCoverUrl(coverFile) : old.cover_url,
  };

  await knex("playlists").where({ playlist_id: id }).update(updateData);

  if (song_ids && Array.isArray(song_ids)) {
    await knex("playlistsongs").where({ playlist_id: id }).del();
    const inserts = song_ids.map((song_id) => ({ playlist_id: id, song_id }));
    await knex("playlistsongs").insert(inserts);
  }

  return {
    playlist_id: id,
    ...updateData,
    song_ids: song_ids ?? (await getSongIdsByPlaylist(id)),
  };
}

async function getSongIdsByPlaylist(id) {
  const rows = await knex("playlistsongs")
    .where({ playlist_id: id })
    .select("song_id");
  return rows.map((r) => r.song_id);
}
async function deletePlaylistById(id) {
  return await knex("playlists").where({ playlist_id: id }).del();
}

module.exports = {
  createPlaylistWithSongs,
  getAllPlaylists,
  updatePlaylist,
  deletePlaylistById,
  deleteAllPlaylists,
};
