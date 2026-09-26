// Generic role-check middleware. Use this instead of hardcoded per-role
// middleware (like isAdmin) when you need to allow more than one role,
// e.g. requireRole(['admin', 'editor']).
module.exports = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
