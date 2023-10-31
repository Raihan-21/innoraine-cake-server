const express = require("express");
const router = express.Router();

const { Pool } = require("pg");
const { config } = require("../configs/database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const productService = require("../controllers/products");
const userService = require("../controllers/users");
const authService = require("../controllers/auth");
const orderService = require("../controllers/order");
// const userService = new UserController();

// const productService = new ProductController();

const pool = new Pool({
  connectionString:
    "postgresql://postgres:Vh4zNM3jbRVKafx4YINE@containers-us-west-11.railway.app:6146/railway",
});
// pool.connect();

/**
 *
 * ================ Auth Services ====================
 *
 */
router.post("/login", authService.userLogin);
router.post("/register", authService.register);

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

router.get("/v2/products", productService.supabaseGetItems);
router.get("/v2/products/:id", productService.getDetail);
router.get("/v2/products/gallery/:id", productService.getProductImages);

/**
 *
 * =============== Cart Services ==================
 *
 */
router.get("/cart/:id_user", userService.getCart);
router.get("/cart/total/:id_user", userService.getCartTotalItems);
router.post("/cart", userService.addItemToCart);
router.put("/cart", userService.updateCartItem);
router.delete("/cart/:userid/:id", userService.deleteCartItem);

router.post("/order", orderService.postOrder);
router.get("/order", orderService.getOrder);
router.get("/order/:id", orderService.getOrderDetail);

router.get("/user/profile/:id", userService.getUserProfile);
module.exports.mainRouter = router;
