const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

async function hashPassword(password) {
  return await bcrypt.hash(password, 5);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function authenticateUser(email, password, userService) {
  const user = await userService.getByEmail(email);
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) throw new ApiError(401, "Invalid email or password");

  const token = generateToken(user);
  return { token, user };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateUser,
};
