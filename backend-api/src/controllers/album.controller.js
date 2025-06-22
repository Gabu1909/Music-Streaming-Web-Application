const knex = require("../database/knex");
const JSend = require("../jsend");
const albumService = require("../services/albums.service");
const AlbumController = {
  async getAllAlbum(req, res, next) {
    try {
      const albums = await knex("albums").select("*");
      res.status(200).json(JSend.success({ albums }));
    } catch (err) {
      next(err);
    }
  },
  async createAlbum(req, res, next) {
    try {
      const album = await albumService.createAlbumWithSongs(req);
      res.status(201).json(JSend.success({ album }));
    } catch (err) {
      next(err);
    }
  },

  async getByAlbumId(req, res, next) {
    try {
      const { id } = req.params;
      const album = await knex("albums").where({ album_id: id }).first();

      if (!album) {
        return res.status(404).json(JSend.fail("Album not found"));
      }

      res.status(200).json(JSend.success({ album }));
    } catch (err) {
      next(err);
    }
  },

  async updateAlbum(req, res, next) {
    try {
      const { id } = req.params;
      const result = await albumService.updateAlbum(id, req.body, req.files);
      res.status(200).json(JSend.success(result));
    } catch (err) {
      next(err);
    }
  },

  async deleteAlbum(req, res, next) {
    try {
      const { id } = req.params;
      const result = await albumService.deleteAlbumById(id);
      res.status(200).json(JSend.success(result));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AlbumController;
