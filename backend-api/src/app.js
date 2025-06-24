const express = require("express");
const cors = require("cors");
const RateLimiter = require("./middlewares/rate_limit");
const JSend = require("./jsend");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../docs/open-api.json");
const usersRouter = require("./routes/users.route");
const songRoutes = require("./routes/songs.route");
const albumRoutes = require("./routes/album.route");
const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const artistRoutes = require("./routes/artists.route");
const playlistRoutes = require("./routes/playlist.route");
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", RateLimiter);
app.use("/api/users", usersRouter);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/artists", artistRoutes);
app.use(resourceNotFound);
app.use(handleError);
module.exports = app;
