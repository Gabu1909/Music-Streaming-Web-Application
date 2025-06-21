const knex = require("../database/knex");
const path = require("path");
const { findOrCreateArtistByName } = require("./artists.service");
const mm = require("music-metadata");

function getAudioUrl(file) {
  return `public/uploads/audio/${file.filename}`;
}

function getCoverUrl(file) {
  return `public/uploads/images/${file.filename}`;
}

function getCleanTitle(originalName) {
  const utf8Title = Buffer.from(originalName, "latin1").toString("utf8");
  return path.parse(utf8Title).name;
}

async function getAudioDuration(filePath) {
  try {
    const metadata = await mm.parseFile(filePath);
    return Number(metadata.format.duration?.toFixed(2)) || null;
  } catch (error) {
    return null;
  }
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

    const [newAlbum] = await trx("albums")
      .insert({
        title,
        artist_id: artistObj.artist_id,
        release_date,
        cover_url: coverFile ? getCoverUrl(coverFile) : null,
      })
      .returning("*");

    const songsToInsert = [];

    for (const file of songFiles) {
      const title = getCleanTitle(file.originalname);
      const duration = await getAudioDuration(
        path.resolve("public/uploads/audio", file.filename)
      );

      songsToInsert.push({
        title,
        album_id: newAlbum.album_id,
        artist_id: artistObj.artist_id,
        audio_url: getAudioUrl(file),
        duration,
      });
    }

    if (songsToInsert.length > 0) {
      await trx("songs").insert(songsToInsert);
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
    updatePayload.cover_url = `public/uploads/images/${coverFile.filename}`;
  }

  if (artist) {
    const foundArtist = await findOrCreateArtistByName(artist);
    if (!foundArtist) throw new Error("Artist not found or created");

    if (foundArtist.artist_id !== currentAlbum.artist_id) {
      updatePayload.artist_id = foundArtist.artist_id;
    }
  }

  let updatedAlbum;
  if (Object.keys(updatePayload).length > 0) {
    [updatedAlbum] = await knex("albums")
      .where({ album_id: id })
      .update(updatePayload)
      .returning("*");
  } else {
    updatedAlbum = currentAlbum;
  }

  const newSongs = [];
  for (const file of songFiles) {
    const rawTitle = file.originalname;
    const utf8Title = Buffer.from(rawTitle, "latin1").toString("utf8");
    const cleanTitle = path.parse(utf8Title).name;
    const artistIdToUse = updatePayload.artist_id || currentAlbum.artist_id;

    const audioPath = path.resolve("public/uploads/audio", file.filename);
    const duration = await getAudioDuration(audioPath);

    const [inserted] = await knex("songs")
      .insert({
        title: cleanTitle,
        album_id: id,
        artist_id: artistIdToUse,
        audio_url: `/uploads/audio/${file.filename}`,
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
module.exports = {
  findOrCreateAlbumByName,
  createAlbumWithSongs,
  updateAlbum,
  deleteAlbumById,
};
