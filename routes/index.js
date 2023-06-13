const express = require("express");
const router = express.Router();

const { Pool } = require("pg");
const { config } = require("../configs/database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ProductController = require("../controllers/products");

const productService = new ProductController();

const pool = new Pool({
  connectionString:
    "postgresql://postgres:Vh4zNM3jbRVKafx4YINE@containers-us-west-11.railway.app:6146/railway",
});
// pool.connect();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const queryString = `SELECT users.*, roles.nama_role as nama_role FROM users JOIN user_roles ON users.id = user_roles.id_user JOIN roles ON roles.id = user_roles.id_role WHERE email= $1 AND roles.id = 2`;
  const values = [email];
  try {
    const query = await pool.query(queryString, values);
    // console.log(query);
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
    const query = await pool.query("SELECT * FROM kategori");
    res.json({ body: query.rows });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 *
 *  =============== Products Services ===============
 *
 */

router.get("/products", productService.getItems);
router.get("/products/:id", productService.getDetail);
router.get("/products/gallery/:id", productService.getProductImages);

module.exports.mainRouter = router;
