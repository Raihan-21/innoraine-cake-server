const express = require("express");
const router = express.Router();

const { config } = require("../configs/database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminPool } = require("../database/admin");
const protectedMiddleware = require("../middlewares/protected");

const productService = require("../controllers/products");
const userService = require("../controllers/users");
const orderService = require("../controllers/order");

/**
 *  ========= CONTROLLER INSTANCE =========
 */

// const productController = new ProductController();
// const userController = new UserController();

/**
 *
 *     ========= ROUTES ==========
 *
 */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const queryString = `SELECT users.*, row_to_json(roles) as role FROM users JOIN roles ON roles.id = users.role WHERE users.email= $1 AND roles.id = 2`;
  const values = [email];
  console.log(email);
  try {
    const query = await adminPool.query(queryString, values);
    console.log(query);
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

/**
 *
 *    ========== USERS SERVICES ===========
 *
 */

router.get("/users", userService.getUsers);

/**
 *
 *    ========== PROTECTED PRODUCTS SERVICES ===========
 *
 */

router.get("/products", productService.getItems);
router.post("/products", protectedMiddleware, productService.postItem);
router.delete("/products/:id", productService.deleteItem);

router.get("/orders", orderService.getOrders);
router.post("/orders/toggle", orderService.toggleOrder);
router.delete("/orders/:id", orderService.deletOrder);

router.get("/v2/products", productService.supabaseGetItems);
router.post("/v2/products", protectedMiddleware, productService.postItem);
router.delete("/v2/products/:id", productService.deleteItem);

module.exports.cmsRouter = router;
