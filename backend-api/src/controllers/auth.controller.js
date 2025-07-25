const userService = require("../services/users.service");
const authService = require("../services/auth.service");
const ApiError = require("../api-error");
const { loginSchema } = require("../schemas/user.schema");
function getImgPath(file) {
  return `/uploads/img/${file.filename}`;
}
async function createUser(req, res, next) {
  try {
    const { username, email, password, role } = req.body;
    const avatarFile = req.files?.avatar_url?.[0];
    const avatar_url = avatarFile ? getImgPath(avatarFile) : null;
    const existing = await userService.getByEmail(email);
    if (existing) return next(new ApiError(400, "Email already exists"));
    const password_hash = await authService.hashPassword(password);
    const newUser = await userService.create({
      username,
      email,
      password_hash,
      avatar_url,
      role: role || "user",
    });
    res.status(201).json({ status: "success", data: newUser });
  } catch {
    next(new ApiError(500, "Create user failed"));
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { token, user } = await authService.authenticateUser(
      email,
      password,
      userService
    );

    res.json({
      status: "success",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

module.exports = {
  createUser,
  login,
};
