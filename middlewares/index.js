const { adminPool } = require("../database/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mainMiddleware = async (req, res, next) => {
  if (req.path === "/login") return next();
  const authorization = req.headers.authorization;

  const token = authorization.substr(authorization.indexOf(" ") + 1);
  console.log(token);
  if (token === "undefined") return res.status(401).send("Unauthorized");
  // else {
  const tokenData = await jwt.verify(token, "innorainetoken");

  // const res = await adminPool.query('SELECT email, password from users WHERE ')
  if (!tokenData) return res.status(401).send("Unauthorized");
  next();
  // }
};
module.exports = mainMiddleware;
