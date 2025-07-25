const knex = require("../database/knex");

async function create(artistData) {
  const [artist] = await knex("artists").insert(artistData).returning("*");
  return artist;
}

async function findSongsByArtistId(artist_id) {
  const songs = await knex("songs as s")
    .join("songartists as sa", "sa.song_id", "s.song_id")
    .leftJoin("artists as a", "a.artist_id", "sa.artist_id")
    .whereIn("s.song_id", function () {
      this.select("song_id")
        .from("songartists")
        .where("artist_id", artist_id);
    })
    .groupBy("s.song_id")
    .select(
      "s.song_id",
      "s.title",
      "s.audio_url",
      "s.duration",
      "s.image_url",
      knex.raw(`
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT('artist_id', a.artist_id, 'name', a.name)
          ) FILTER (WHERE a.artist_id IS NOT NULL),
          '[]'
        ) AS artists
      `)
    );

  return songs.map(song => ({
    ...song,
    artists: typeof song.artists === 'string' ? JSON.parse(song.artists) : song.artists
  }));
}


async function findAlbumsByArtistId(artistId) {
    const albums = await knex('albums')
      .where('artist_id', artistId)
      .select('album_id', 'title', 'release_date', 'cover_url');

    return albums;
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

async function deleteAll() {
  await knex("artists").del();
}

async function findAll() {
  return knex("artists").select("*");
}

async function findAllWithFilters({ name, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;

  let query = knex("artists").select("*");
  let countQuery = knex("artists").count("* as count");

  if (name) {
    const lowerName = name.toLowerCase();
    query = query.whereRaw("LOWER(name) LIKE ?", [`%${lowerName}%`]);
    countQuery = countQuery.whereRaw("LOWER(name) LIKE ?", [`%${lowerName}%`]);
  }

  query = query.limit(limit).offset(offset);

  const [artists, countResult] = await Promise.all([query, countQuery]);
  const totalRecords = Number(countResult[0].count);
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    artists,
    metadata: {
      totalRecords,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    },
  };
}

async function updateById(artistId, updatedData) {
  const [artist] = await knex("artists")
    .where("artist_id", artistId)
    .update(updatedData)
    .returning("*");
  return artist;
}

async function deleteById(artistId) {
  return knex("artists").where("artist_id", artistId).del();
}

async function countArtists() {
  const result = await knex("artists").count("* as count").first();
  return Number(result.count);
}

async function find({ query }) {
  if (!query) return { data: [] };
  const artists = await knex("artists")
    .select("artist_id", "name", "avatar_url")
    .whereRaw("LOWER(name) LIKE ?", [`%${query.toLowerCase()}%`])
    .limit(10);
  return { data: artists };
}
module.exports = {
  create,
  find,
  findByName,
  findById,
  findByUserId,
  findOrCreateArtistByName,
  deleteAll,
  findAll,
  findAllWithFilters,
  updateById,
  deleteById,
  findSongsByArtistId,
  findAlbumsByArtistId,
  countArtists,
};
