const songService = require("../services/songs.service");
const artistService = require("../services/artists.service");
const albumService = require("../services/albums.service");
const mm = require("music-metadata");
const ApiError = require("../api-error");
const { updateSongSchema } = require("../schemas/song.schema");
const JSend = require("../jsend");

function getAudioPath(file) {
  return `public/uploads/audio/${file.filename}`;
}

function getImgPath(file) {
  return `public/uploads/images/${file.filename}`;
}

async function getDuration(filePath) {
  const metadata = await mm.parseFile(filePath);
  return Number(metadata.format.duration?.toFixed(2)) || null;
}
async function addSong(req, res, next) {
  try {
    const { title, artist: artistRaw, album: albumName } = req.body;
    const audioFile = req.files?.audio_files?.[0];
    if (!audioFile) return next(new ApiError(400, "Audio file is required"));

    const audioUrl = getAudioPath(audioFile);
    const duration = await getDuration(audioUrl);
    const imgUrl = req.files?.cover?.[0]
      ? getImgPath(req.files.cover[0])
      : null;
    const artistNames = artistRaw.split(",").map((n) => n.trim());
    const artistObjs = [];
    for (const name of artistNames) {
      const artist = await artistService.findOrCreateArtistByName(name);
      if (!artist?.artist_id)
        return next(new ApiError(500, `Cannot find/create artist: ${name}`));
      artistObjs.push(artist);
    }

    let album_id = null;
    if (albumName) {
      const album = await albumService.findOrCreateAlbumByName(
        albumName,
        artistObjs[0].artist_id
      );

      if (!album?.album_id)
        return next(new ApiError(404, "Cannot create/find album"));
      album_id = album.album_id;
    }

    const song = await songService.createSong({
      title,
      artist_id: artistObjs[0].artist_id,
      album_id,
      audio_url: audioUrl,
      image_url: imgUrl,
      duration,
    });

    for (const artist of artistObjs) {
      await songService.addArtistToSong(song.song_id, artist.artist_id);
    }

    res
      .status(201)
      .set({ Location: `${req.baseUrl}/${song.song_id}` })
      .json(JSend.success({ song }));
  } catch (err) {
    console.error("AddSong Error:", err);
    next(new ApiError(500, "Internal Server Error"));
  }
}

async function updateSong(req, res, next) {
  try {
    const { id } = req.params;
    const songData = updateSongSchema.parse(req.body);
    const updatePayload = { ...songData };

    const audioFile = req.files?.audio_files?.[0];
    if (audioFile) {
      const audioUrl = getAudioPath(audioFile);
      updatePayload.audio_url = audioUrl;
      updatePayload.duration = await getDuration(audioUrl);
    }

    const coverFile = req.files?.cover?.[0];
    if (coverFile) updatePayload.image_url = getImgPath(coverFile);

    const currentSong = await songService.getSongById(id);
    if (!currentSong) return next(new ApiError(404, "Song not found"));

    if (songData.artist) {
      const currentArtist = await artistService.findOrCreateArtistByName(
        songData.artist
      );
      if (!currentArtist?.artist_id)
        return next(new ApiError(404, "Artist not found"));
      updatePayload.artist_id = currentArtist.artist_id;
    }

    if ("album" in songData) {
      const albumName = songData.album?.trim();
      if (!albumName) {
        updatePayload.album_id = null;
      } else {
        const album = await albumService.findOrCreateAlbumByName(
          albumName,
          updatePayload.artist_id || currentSong.artist_id
        );
        updatePayload.album_id = album.album_id;
      }
    }
    delete updatePayload.artist;
    delete updatePayload.album;

    const updated = await songService.updateSong(id, updatePayload);
    if (!updated) return next(new ApiError(404, "Song not found"));

    res.json(JSend.success({ song: updated }));
  } catch (err) {
    console.error("UpdateSong Error:", err);
    next(new ApiError(400, err.message));
  }
}

async function getSongsByFilter(req, res, next) {
  try {
    const { songs, pagination } = await songService.getSongsByFilter(req.query);

    if (songs.length === 0)
      return res.status(404).json(JSend.error("No songs found"));

    res.json(JSend.success({ songs, pagination }));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
}

async function getSongById(req, res, next) {
  try {
    const { id } = req.params;
    const song = await songService.getSongById(id);
    if (!song) return next(new ApiError(404, "Song not found"));
    res.json(JSend.success({ song }));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
}

async function deleteSong(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await songService.deleteSong(id);
    if (!deleted) return next(new ApiError(404, "Song not found"));
    res.json(JSend.success("Song deleted"));
  } catch (err) {
    next(new ApiError(500, err.message));
  }
}
async function deleteAllSongs(req, res) {
  try {
    await songService.deleteAllSong();
    return res.json(JSend.success({ message: "All songs have been deleted" }));
  } catch (error) {
    console.error("Error deleting all songs:", error);
    return res.status(500).json(JSend.error("Internal server error"));
  }
}

module.exports = {
  addSong,
  updateSong,
  deleteAllSongs,
  getSongsByFilter,
  getSongById,
  deleteSong,
};
