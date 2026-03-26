const jwt = require("jsonwebtoken");

// This middleware runs before any protected route
// Its job is to check if the request has a valid JWT token
module.exports = (req, res, next) => {

  // The token comes in the Authorization header
  // It will look like: "Bearer eyJhbGciOiJIUzI1NiIsInR..."
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. Please login first." });
  }

  // Strip the "Bearer " prefix to get just the token string
  // If someone sends it without "Bearer ", we handle that too
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    // jwt.verify checks if the token is valid and not expired
    // It decodes the payload we stored during login (id and role)
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request so the next function can use it
    req.user = decodedPayload;

    // Move on to the actual route handler
    next();

  } catch (err) {
    // This happens if the token is expired or tampered with
    res.status(401).json({ message: "Session expired or invalid. Please login again." });
  }
};