const knex = require("../database/knex");

async function create(artistData) {
  const [artist] = await knex("artists").insert(artistData).returning("*");
  return artist;
}

async function findByName(name) {
  return knex("artists").where("name", name).first();
}

async function findById(artistId) {
  return knex("artists").where("artist_id", artistId).first();
}

async function findByUserId(userId) {
  return knex("artists").where("user_id", userId).first();
}

async function findOrCreateArtistByName(artistName) {
  const existing = await knex("artists")
    .whereRaw("LOWER(name) = LOWER(?)", [artistName])
    .first();

  if (existing) return existing;

  const [artist_id] = await knex("artists")
    .insert({ name: artistName })
    .returning("artist_id");
  return await knex("artists").where({ artist_id }).first();
}

module.exports = {
  create,
  findByName,
  findById,
  findByUserId,
  findOrCreateArtistByName,
};
