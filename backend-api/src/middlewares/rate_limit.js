const rateLimit = require("express-rate-limit");
const { fail } = require("../jsend");

const jsendHandler = (message) => (req, res) => {
  res.status(429).json(fail(message));
};

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: jsendHandler("Too many requests. Please slow down."),
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  handler: jsendHandler("Too many login attempts. Try again in 5 minutes."),
});

const favoriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: jsendHandler("Too many favorite actions. Please slow down."),
});

const updateUserLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  handler: jsendHandler("Too many update attempts. Please try again later."),
});

module.exports = {
  generalLimiter,
  authLimiter,
  favoriteLimiter,
  updateUserLimiter,
};
