// Role middleware - checks if the logged-in user has the right role
// We use this as a second check after the auth middleware confirms identity
// Usage: roleMiddleware("admin") or roleMiddleware("employee")
module.exports = (requiredRole) => {
  return (req, res, next) => {

    // req.user was set by autmiddleware during token verification
    const userRole = req.user.role;

    if (userRole !== requiredRole) {
      return res.status(403).json({
        message: `Access denied. This action requires the '${requiredRole}' role.`
      });
    }

    // Role matches, let the request continue
    next();
  };
};