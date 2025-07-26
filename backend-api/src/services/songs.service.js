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
  const song = await knex("songs as s")
    .join("songartists as sa", "s.song_id", "sa.song_id")
    .join("artists as a", "sa.artist_id", "a.artist_id")
    .where("s.song_id", song_id)
    .groupBy("s.song_id")
    .select(
      "s.song_id",
      "s.title",
      "s.audio_url",
      "s.duration",
      "s.image_url",
      knex.raw(`
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('artist_id', a.artist_id, 'name', a.name)
        ) AS artists
      `)
    )
    .first();

  return song;
}



async function getSongs() {
  
  const totalResult = await knex("songs as s")
    .countDistinct("s.song_id as count")
    .first();

  const songs = await knex("songs as s")
    .leftJoin("songartists as sa", "s.song_id", "sa.song_id")
    .leftJoin("artists as a", "sa.artist_id", "a.artist_id")
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
    )


  const parsedSongs = songs.map((song) => ({
    ...song,
    artists: typeof song.artists === "string" ? JSON.parse(song.artists) : song.artists,
  }));

  return {
    songs: parsedSongs,
    pagination: {
      total: parseInt(totalResult.count),
    },
  };
}


async function countSongs() {
  const result = await knex("songs").count("song_id as total");
  return Number(result[0].total);
}
async function find({ query }) {
  if (!query) return { data: [] };
  const songs = await knex("songs")
    .select("songs.song_id", "songs.title", "artists.name as artist_name", "songs.image_url")
    .join("artists", "songs.artist_id", "artists.artist_id")
    .whereRaw("LOWER(songs.title) LIKE ? OR LOWER(artists.name) LIKE ?", [
      `%${query.toLowerCase()}%`,
      `%${query.toLowerCase()}%`
    ])
    .limit(10);
  return { data: songs };
}

module.exports = {
  songRepository,
  find,
  readsongData,
  createSong,
  updateSong,
  deleteAllSong,
  deleteSong,
  addArtistToSong,
  getSongById,
  getSongs,
  countSongs,
};
