const express = require("express");
const cors = require("cors");
const { generalLimiter } = require("./middlewares/rate_limit");
const JSend = require("./jsend");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../docs/open-api.json");
const usersRouter = require("./routes/users.route");
const songRoutes = require("./routes/songs.route");
const albumRoutes = require("./routes/album.route");
const authRoutes = require("./routes/auth.route");
const artistRoutes = require("./routes/artists.route");
const playlistRoutes = require("./routes/playlist.route");

const searchService = require('./services/search.service');

const app = express();
const {
  resourceNotFound,
  handleError,
} = require("./controllers/error.controller");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  return res.json(JSend.success());
});
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  try {
    const results = await searchService.search(query);
    res.status(200).json({ status: 'success', data: results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

app.use("/api", generalLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/users", usersRouter);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/playlists", playlistRoutes);
app.use(resourceNotFound);
app.use(handleError);
module.exports = app;
