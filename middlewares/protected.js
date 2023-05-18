const adminPool = require("../database/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const protectedMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  // const token = authorization.substr(authorization.indexOf(" ") + 1);
  // console.log(token);
  // if (token === "undefined") return res.status(401).send("Unauthorized");
  // else {
  // const tokenData = await jwt.verify(token, "innorainetoken");
  // if (!tokenData) return res.status(401).send("Unauthorized");
  // const query = await adminPool.query(
  //   "SELECT email, password from users WHERE email = $1",
  //   [tokenData]
  // );
  // if (!res.rowCount) res.status(401).send("Unauthorized");
  next();
  // }
};

module.exports = protectedMiddleware;
