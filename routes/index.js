const express = require("express");
const router = express.Router();

const { Pool } = require("pg");
const { config } = require("../configs/database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const productService = require("../controllers/products");
const userService = require("../controllers/users");
const authService = require("../controllers/auth");
// const userService = new UserController();

// const productService = new ProductController();

const pool = new Pool({
  connectionString:
    "postgresql://postgres:Vh4zNM3jbRVKafx4YINE@containers-us-west-11.railway.app:6146/railway",
});
// pool.connect();

router.post("/login", authService.login);

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

/**
 *
 * =============== Cart Services ==================
 *
 */
router.get("/cart/:id_user", userService.getCart);
router.post("/cart", userService.addItemToCart);

module.exports.mainRouter = router;
