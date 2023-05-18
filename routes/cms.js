const express = require("express");
const router = express.Router();

const { config } = require("../configs/database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminPool = require("../database/admin");
const protectedMiddleware = require("../middlewares/protected");

router.get("/products", async (req, res) => {
  try {
    const queryString =
      "SELECT produk.*, row_to_json(kategori) as kategori FROM produk JOIN kategori ON produk.id_kategori = kategori.id";
    const query = await adminPool.query(queryString);
    res.json({ body: query.rows });
  } catch (error) {
    res.json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const queryString = `SELECT users.*, roles.nama_role as nama_role FROM users JOIN user_roles ON users.id = user_roles.id_user JOIN roles ON roles.id = user_roles.id_role WHERE email= $1 AND roles.id = 2`;
  const values = [email];
  try {
    const query = await adminPool.query(queryString, values);
    if (!query.rowCount) {
      throw new Error("User admin tidak ditemukan");
    }
    const authenticated = await bcrypt.compare(
      password,
      query.rows[0].password
    );
    if (!authenticated) throw new Error("Password salah!");
    const token = await jwt.sign(email, "innorainetoken");
    res.json({ token, body: query.rows[0] });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.get("/categories", async (req, res) => {
  try {
    const query = await adminPool.query("SELECT * FROM kategori");
    res.json({ body: query.rows });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/products", protectedMiddleware, async (req, res) => {
  const queryString =
    "INSERT INTO produk(nama_produk, id_kategori, deskripsi, harga, stok) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const values = Object.values(req.body).map((value) => value);
  try {
    const query = await adminPool.query(queryString, values);
    res.json({ body: query.rows[0] });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
router.delete("/products/:id", async (req, res) => {
  const queryString = "DELETE FROM produk WHERE id = $1";
  const values = [req.params.id];
  try {
    const query = await adminPool.query(queryString, values);
    res.json({ body: query });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports.cmsRouter = router;
