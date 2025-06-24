const knex = require("../database/knex");

function songRepository() {
  return knex("songs");
}

function readsongData(payload) {
  return {
    ...(payload.title && { title: payload.title }),
    ...(payload.artist_id && { artist_id: payload.artist_id }),
    ...(payload.album_id && { album_id: payload.album_id }),
    ...(payload.audio_url && { audio_url: payload.audio_url }),
    ...(payload.duration && { duration: payload.duration }),
    ...(payload.image_url && { image_url: payload.image_url }),
    ...(payload.created_at && { created_at: payload.created_at }),
  };
}

async function createSong(data) {
  const [song] = await knex("songs").insert(data).returning("*");
  return song;
}

async function updateSong(song_id, updatePayload) {
  const [updated] = await knex("songs")
    .where({ song_id })
    .update(updatePayload)
    .returning("*");
  return updated;
}

async function deleteSong(song_id) {
  return knex("songs").where({ song_id }).del();
}
async function deleteAllSong() {
  return knex("songs").del();
}

async function addArtistToSong(song_id, artist_id) {
  return knex("songartists").insert({ song_id, artist_id });
}

async function getSongById(song_id) {
  return knex("songs").where({ song_id }).first();
}

async function getSongsByFilter({ title, artist, limit, page }) {
  const query = knex("songs");

  if (title)
    query.whereRaw("LOWER(title) LIKE ?", [`%${title.toLowerCase()}%`]);
  if (artist)
    query.whereRaw("LOWER(artist) LIKE ?", [`%${artist.toLowerCase()}%`]);

  const l = Math.max(1, parseInt(limit) || 10);
  const p = Math.max(1, parseInt(page) || 1);
  const offset = (p - 1) * l;

  const totalResult = await query.clone().count("song_id as count").first();
  const songs = await query.clone().limit(l).offset(offset);

  return {
    songs,
    pagination: {
      page: p,
      limit: l,
      total: parseInt(totalResult.count),
    },
  };
}

async function countSongs() {
  const result = await knex("songs").count("song_id as total");
  return Number(result[0].total);
}

module.exports = {
  songRepository,
  readsongData,
  createSong,
  updateSong,
  deleteAllSong,
  deleteSong,
  addArtistToSong,
  getSongById,
  getSongsByFilter,
  countSongs,
};
