const knex = require("../database/knex");

async function create(userData) {
  const [user] = await knex("users").insert(userData).returning("*");
  return user;
}

async function getByEmail(email) {
  return await knex("users").where({ email }).first();
}

async function getAll() {
  return await knex("users").select("*");
}

async function getById(id) {
  return await knex("users").where({ user_id: id }).first();
}

async function update(id, updateData) {
  const [user] = await knex("users")
    .where({ user_id: id })
    .update(updateData)
    .returning("*");
  return user;
}

async function remove(id) {
  await knex("users").where({ user_id: id }).del();
}

async function addFavoriteSong(userId, songId) {
  await knex("favorites")
    .insert({ user_id: userId, song_id: songId })
    .onConflict(["user_id", "song_id"])
    .ignore();
  return { user_id: userId, song_id: songId };
}
async function removeFavoriteSong(userId, songId) {
  await knex("favorites").where({ user_id: userId, song_id: songId }).del();
}
async function getFavSong(userId) {
  return await knex("favorites")
    .where({ user_id: userId })
    .join("songs", "favorites.song_id", "songs.song_id")
    .select("songs.*");
}

module.exports = {
  create,
  getByEmail,
  getAll,
  getById,
  update,
  remove,
  addFavoriteSong,
  getFavSong,
  removeFavoriteSong,
};
