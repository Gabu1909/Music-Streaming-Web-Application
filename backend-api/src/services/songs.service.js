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

async function addArtistToSong(song_id, artist_id) {
  return knex("songartists").insert({ song_id, artist_id });
}

async function getSongById(song_id) {
  return knex("songs").where({ song_id }).first();
}

async function getSongsByFilter({ title, artist, genre }) {
  const query = knex("songs");
  if (title)
    query.whereRaw("LOWER(title) LIKE ?", [`%${title.toLowerCase()}%`]);
  if (artist)
    query.whereRaw("LOWER(artist) LIKE ?", [`%${artist.toLowerCase()}%`]);
  if (genre)
    query.whereRaw("LOWER(genre) LIKE ?", [`%${genre.toLowerCase()}%`]);
  return query.select();
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
  deleteSong,
  addArtistToSong,
  getSongById,
  getSongsByFilter,
  countSongs,
};
