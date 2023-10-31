const { adminPool } = require("../database/admin");
const { sqlConditionGenerator } = require("../helpers/helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userService = require("./users");
// const userService = new UserController();

class Auth {
  async login(req, res) {
    const { email, password } = req.body;
    const queryString = `SELECT users.*, row_to_json(roles) as role FROM users JOIN user_roles ON users.id = user_roles.id_user JOIN roles ON roles.id = user_roles.id_role WHERE email= $1`;
    const values = [email];
    try {
      const query = await adminPool.query(queryString, values);
      //   console.log(query);
      if (!query.rowCount) {
        throw new Error("User admin tidak ditemukan");
      }
      const authenticated = await bcrypt.compare(
        password,
        query.rows[0].password
      );
      if (!authenticated) throw new Error("Password salah!");
      const token = await jwt.sign(email, "innorainetoken");
      const { password: userPass, ...user } = query.rows[0];
      res.json({ token, body: user });
    } catch (error) {
      res.status(401).send(error.message);
    }
  }
  async userLogin(req, res) {
    const { email, password } = req.body;
    const queryString = `SELECT users.*, row_to_json(roles) as role FROM users JOIN roles ON roles.id = users.role WHERE email= $1`;
    const values = [email];
    try {
      const query = await adminPool.query(queryString, values);
      //   console.log(query);
      if (!query.rowCount) {
        throw new Error("User tidak ditemukan");
      }
      const authenticated = await bcrypt.compare(
        password,
        query.rows[0].password
      );
      if (!authenticated) throw new Error("Password salah!");
      const token = await jwt.sign(email, "innorainetoken");
      const { password: userPass, ...user } = query.rows[0];
      res.json({ token, body: user });
    } catch (error) {
      res.status(401).send(error.message);
    }
  }
  async register(req, res) {
    const { nama, email, no_telp, alamat, password } = req.body;
    try {
      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(password, salt);
      const queryString =
        "INSERT INTO users(nama, email, no_telp, alamat, role, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
      const queryValues = [nama, email, no_telp, alamat, 1, hashedPw];
      const query = await adminPool.query(queryString, queryValues);
      res.json({ body: query.rows[0] });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}

const authService = new Auth();
module.exports = authService;
