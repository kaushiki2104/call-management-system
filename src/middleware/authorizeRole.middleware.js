
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.orgRole)) {
      return res.status(403).json({ message: `This route is only for the ${roles} but you are ${req.user.orgRole}` });
    }

    next();
  };
};

export default authorizeRoles;