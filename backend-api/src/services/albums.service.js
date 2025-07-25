const knex = require("../database/knex");
const path = require("path");
const mm = require("music-metadata");
const { findOrCreateArtistByName } = require("./artists.service");

function getAudioUrl(file) {
  return `public/uploads/audio/${file.filename}`;
}

function getCoverUrl(file) {
  return `public/uploads/img/${file.filename}`;
}

function getCleanTitle(originalName) {
  const utf8Title = Buffer.from(originalName, "latin1").toString("utf8");
  return path.parse(utf8Title).name;
}

async function getAudioDuration(filePath) {
  try {
    const metadata = await mm.parseFile(filePath);
    return Number(metadata.format.duration?.toFixed(2)) || null;
  } catch {
    return null;
  }
}


async function getAllAlbums() {
  return await knex("albums")
    .join("artists", "albums.artist_id", "artists.artist_id")
    .select(
      "albums.album_id",
      "albums.title as title",
      "albums.cover_url",
      "albums.release_date",
      "artists.artist_id",
      "artists.name as artist_name"
    );
}

async function getAlbumById(id) {
  return await knex("albums")
    .join("artists", "albums.artist_id", "artists.artist_id")
    .select(
      "albums.album_id",
      "albums.title as title",
      "albums.cover_url",
      "albums.release_date",
      "artists.artist_id",
      "artists.name as artist_name"
    )
    .where("albums.album_id", id)
    .first();
}

async function getAlbumWithSongs(albumId) {
  const album = await getAlbumById(albumId);
  if (!album) return null;

  const songs = await knex("songs")
    .join("artists", "songs.artist_id", "artists.artist_id")
    .select(
      "songs.song_id",
      "songs.title",
      "songs.duration",
      "songs.audio_url",
      "songs.album_id",
      "artists.name as artist"
    )
    .where("songs.album_id", albumId);

  return { album, songs };
}

async function findOrCreateAlbumByName(title, artist_id) {
  const existing = await knex("albums")
    .whereRaw("LOWER(title) = ?", [title.toLowerCase()])
    .andWhere("artist_id", artist_id)
    .first();

  if (existing) return existing;

  const [created] = await knex("albums")
    .insert({
      title,
      artist_id,
      release_date: new Date(),
    })
    .returning("*");

  return created;
}

async function createAlbumWithSongs(req) {
  const trx = await knex.transaction();
  try {
    const { title, artist, release_date } = req.body;
    const coverFile = req.files?.cover?.[0];
    const songFiles = req.files?.audio_files || [];

    const artistObj = await findOrCreateArtistByName(artist);
    const coverUrl = coverFile ? getCoverUrl(coverFile) : null;

    const [newAlbum] = await trx("albums")
      .insert({
        title,
        artist_id: artistObj.artist_id,
        release_date,
        cover_url: coverUrl,
      })
      .returning("*");

    const songsToInsert = [];

    for (const file of songFiles) {
      const cleanTitle = getCleanTitle(file.originalname);
      const duration = await getAudioDuration(
        path.resolve("public/uploads/audio", file.filename)
      );

      songsToInsert.push({
        title: cleanTitle,
        album_id: newAlbum.album_id,
        artist_id: artistObj.artist_id,
        audio_url: getAudioUrl(file),
        duration,
        image_url: newAlbum.cover_url,
      });
    }

    const insertedSongs = songsToInsert.length
      ? await trx("songs").insert(songsToInsert).returning(["song_id", "artist_id"])
      : [];

    if (insertedSongs.length > 0) {
      const artistSongPairs = insertedSongs.map((s) => ({
        artist_id: s.artist_id,
        song_id: s.song_id,
      }));

      await trx("songartists").insert(artistSongPairs).onConflict(["artist_id", "song_id"]).ignore();
    }

    await trx.commit();
    return newAlbum;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

async function updateAlbum(id, body, files) {
  const currentAlbum = await knex("albums").where({ album_id: id }).first();
  if (!currentAlbum) throw new Error("Album not found");

  const { title, release_date, artist } = body;
  const coverFile = files?.cover?.[0];
  const songFiles = files?.audio_files || [];

  const updatePayload = {};

  if (title && title !== currentAlbum.title) {
    updatePayload.title = title;
  }

  if (
    release_date &&
    release_date !== currentAlbum.release_date?.toISOString().split("T")[0]
  ) {
    updatePayload.release_date = release_date;
  }

  if (coverFile) {
    updatePayload.cover_url = getCoverUrl(coverFile);
  }

  if (artist) {
    const foundArtist = await findOrCreateArtistByName(artist);
    if (foundArtist.artist_id !== currentAlbum.artist_id) {
      updatePayload.artist_id = foundArtist.artist_id;
    }
  }

  const [updatedAlbum] = Object.keys(updatePayload).length
    ? await knex("albums").where({ album_id: id }).update(updatePayload).returning("*")
    : [currentAlbum];

  const newSongs = [];

  for (const file of songFiles) {
    const title = getCleanTitle(file.originalname);
    const audioPath = path.resolve("public/uploads/audio", file.filename);
    const duration = await getAudioDuration(audioPath);
    const artistIdToUse = updatePayload.artist_id || currentAlbum.artist_id;

    const [inserted] = await knex("songs")
      .insert({
        title,
        album_id: id,
        artist_id: artistIdToUse,
        audio_url: getAudioUrl(file),
        duration,
      })
      .returning("*");

    newSongs.push(inserted);
  }

  return {
    album: updatedAlbum,
    new_songs: newSongs.length > 0 ? newSongs : undefined,
  };
}

async function deleteAlbumById(albumId) {
  const trx = await knex.transaction();
  try {
    await trx("songs").where({ album_id: albumId }).del();
    const deleted = await trx("albums").where({ album_id: albumId }).del();
    await trx.commit();
    return deleted;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

async function countAlbums() {
  const result = await knex("albums").count("album_id as total");
  return Number(result[0].total);
}

async function find({ query }) {
  if (!query) return { data: [] };

  const albums = await knex("albums")
    .select("albums.album_id", "albums.title", "artists.name as artist_name", "albums.cover_url")
    .join("artists", "albums.artist_id", "artists.artist_id")
    .whereRaw("LOWER(albums.title) LIKE ? OR LOWER(artists.name) LIKE ?", [
      `%${query.toLowerCase()}%`,
      `%${query.toLowerCase()}%`,
    ])
    .limit(10);

  return { data: albums };
}

module.exports = {
  getAllAlbums,
  getAlbumById,
  getAlbumWithSongs,
  findOrCreateAlbumByName,
  createAlbumWithSongs,
  updateAlbum,
  deleteAlbumById,
  countAlbums,
  find,
};
