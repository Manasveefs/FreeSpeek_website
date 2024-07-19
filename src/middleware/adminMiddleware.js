const adminMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (token === process.env.ADMIN_SECRET) {
      next();
    } else {
      res.status(403).send({ error: "Forbidden" });
    }
  } catch (error) {
    res.status(401).send({ message: "Please authenticate as admin" });
  }
};

export default adminMiddleware;
