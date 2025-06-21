const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "public/uploads/others";

    if (file.fieldname === "cover" || file.fieldname === "avatar_url") {
      folder = "public/uploads/images";
    } else if (file.fieldname === "audio_files") {
      folder = "public/uploads/audio";
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const utf8Name = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, utf8Name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "cover" || file.fieldname === "avatar_url") {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  } else if (file.fieldname === "audio_files" || file.fieldname === "audio") {
    const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav"];
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"));
    }
  } else {
    cb(new Error("Unexpected field: " + file.fieldname));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;
