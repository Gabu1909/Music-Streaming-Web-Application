const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch  {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new ApiError(403, "Forbidden: insufficient role"));
    }
    next();
  };
}

function authorizeSelfOrAdmin(req, res, next) {
  const requester = req.user;
  const targetUserId = req.params.id;

  if (!requester) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (requester.role === "admin" || requester.user_id === targetUserId) {
    return next();
  }

  return next(new ApiError(403, "Forbidden: not owner or admin"));
}

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizeSelfOrAdmin,
};
