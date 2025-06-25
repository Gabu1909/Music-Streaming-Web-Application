// middlewares/rate_limit.js
const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 100, // 100 request mỗi phút trên mỗi IP
  message: {
    status: "fail",
    message: "Too many requests. Please slow down.",
  },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    status: "fail",
    message: "Too many login attempts. Try again in 5 minutes.",
  },
});

const favoriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: "fail",
    message: "Too many favorite actions. Please slow down.",
  },
});

const updateUserLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    status: "fail",
    message: "Too many update attempts. Please try again later.",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  favoriteLimiter,
  updateUserLimiter,
};
