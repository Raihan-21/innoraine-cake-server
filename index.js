const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const { mainRouter } = require("./routes");
const mainMiddleware = require("./middlewares");
const { cmsRouter } = require("./routes/cms");

// const client = new MongoClient(
//   "mongodb+srv://raihan:iKeEZyWrdCzvu8UY@cluster0.dyuhm.mongodb.net/ecommerce?retryWrites=true&w=majority"
// );
// const db = client.db("ecommerce");
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "product-image")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "build")));

app.listen(process.env.PORT || 5000, function () {
  console.log("server running on port 5000");
});

app.use("/api/admin", cmsRouter);
// app.use("/api/admin", mainMiddleware, mainRouter);
// const connect = async () => {
//   try {
//     await client.connect();
//     app.get("/api/products", async (req, res) => {
//       try {
//         const products = await db.collection("items").find({}).toArray();
//         res.json({ products });
//       } catch (error) {
//         res.json({ error });
//       }
//     });
//     app.get("/api/products:id", async (req, res) => {
//       try {
//         const product = await db
//           .collection("items")
//           .findOne({ _id: ObjectId(req.params) });
//         res.json({ product });
//       } catch (error) {
//         res.json({ error });
//       }
//     });
//     app.post("/api/login", async (req, res) => {
//       const { email, password } = req.body;
//       const user = await db.collection("customers").findOne({ email: email });
//       const error = {
//         email: "",
//         password: "",
//       };
//       if (user) {
//         const match = await bcrypt.compare(password, user.password);
//         if (match) {
//           const token = jwt.sign({ id: user._id }, "innoraineloginyeah", {
//             expiresIn: 3 * 24 * 60 * 60,
//           });
//           const cart = await db
//             .collection("carts")
//             .findOne({ userid: user._id.toString() });
//           const totalItems = cart.items.reduce(
//             (acc, curr) => {
//               return { quantity: acc.quantity + curr.quantity };
//             },
//             { quantity: 0 }
//           );
//           res.cookie("token", token, {
//             httpOnly: true,
//             maxAge: 3 * 24 * 60 * 60 * 1000,
//           });
//           res.json({
//             user: {
//               userid: user._id,
//               email: user.email,
//               completed: user.completed,
//             },
//             totalItems,
//           });
//         } else {
//           error.password = "Wrong password";
//           res.json({ error });
//         }
//       } else {
//         error.email = "Invalid email";
//         res.json({ error });
//       }
//     });
//     app.get("/api/auth", async (req, res) => {
//       const cookie = req.cookies.token;
//       try {
//         const decoded = await jwt.verify(cookie, "innoraineloginyeah");
//         const user = await db
//           .collection("customers")
//           .findOne({ _id: ObjectId(decoded) });
//         const cart = await db
//           .collection("carts")
//           .findOne({ userid: user._id.toString() });
//         const totalItems = cart.items.reduce(
//           (acc, curr) => {
//             return { quantity: acc.quantity + curr.quantity };
//           },
//           { quantity: 0 }
//         );
//         res.json({
//           user: {
//             userid: user._id,
//             email: user.email,
//             completed: user.completed,
//           },
//           totalItems,
//         });
//       } catch (error) {
//         res.json({ error });
//       }
//     });
//     app.post("/api/register", async (req, res) => {
//       const { email, username, phone, password } = req.body;
//       try {
//         const salt = await bcrypt.genSalt();
//         const hashed = await bcrypt.hash(password, salt);
//         const register = await db.collection("customers").insertOne({
//           email,
//           username,
//           phone,
//           password: hashed,
//           address: {
//             detail: "",
//             kelurahan: "",
//             kecamatan: "",
//             city: "",
//           },
//           completed: false,
//         });
//         res.json({ status: "sukses" });
//       } catch (error) {
//         res.json({ error });
//       }
//     });
//     app.get("/api/logout", (req, res) => {
//       res.cookie("token", "", { maxAge: 1 });
//       res.json({ status: "logged out" });
//     });
//     app.get("/api/cart/:userid", async (req, res) => {
//       const { userid } = req.params;
//       const cart = await db.collection("carts").findOne({ userid });
//       if (cart) {
//         res.json({ cart });
//       } else {
//         res.json({ cart: "empty" });
//       }
//     });
//     app.post("/api/cart/:userid", async (req, res) => {
//       const { userid } = req.params;
//       let { addedItem } = req.body;
//       const addItem = await db.collection("carts").updateOne(
//         { userid },
//         {
//           $push: { items: addedItem },
//           $inc: {
//             totalquantity: addedItem.quantity,
//             totalprice: addedItem.price,
//           },
//         },
//         { upsert: true }
//       );
//     });
//     app.post("/api/cart/:userid/edit", async (req, res) => {
//       const { quantity, price, itemid } = req.body;
//       const updated = await db.collection("carts").updateOne(
//         { userid: req.params.userid, "items._id": itemid },
//         {
//           $inc: {
//             "items.$.quantity": quantity,
//             totalquantity: quantity,
//             totalprice: price,
//           },
//         }
//       );
//       res.json({ status: updated });
//     });
//     app.post("/api/cart/:userid/delete", async (req, res) => {
//       const { userid } = req.params;
//       const { itemid, quantity, price } = req.body;
//       const pullItem = await db.collection("carts").updateOne(
//         { userid },
//         {
//           $pull: { items: { _id: itemid } },
//           $inc: { totalquantity: -quantity, totalprice: -price },
//         }
//       );
//       res.json({ status: pullItem });
//     });
//     app.get("/api/profile/:userid", async (req, res) => {
//       const user = await db
//         .collection("customers")
//         .findOne({ _id: ObjectId(req.params.userid) });
//       res.json({ user });
//     });
//     app.post("/api/profile/:userid/update", async (req, res) => {
//       const data = {
//         username: req.body.username,
//         email: req.body.email,
//         address: {
//           detail: req.body.address,
//           kelurahan: req.body.kelurahan,
//           kecamatan: req.body.kecamatan,
//           city: req.body.kota,
//         },
//         completed: true,
//       };
//       const user = await db
//         .collection("customers")
//         .updateOne({ _id: ObjectId(req.params.userid) }, { $set: data });
//       console.log(user);
//     });
//     app.get("/api/checkout/:userid", async (req, res) => {
//       const user = await db
//         .collection("customers")
//         .findOne({ _id: ObjectId(req.params.userid) });
//       const items = await db
//         .collection("carts")
//         .findOne({ userid: req.params.userid });
//       res.json({
//         user: {
//           username: user.username,
//           address: user.address,
//         },
//         items,
//       });
//     });
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(__dirname, "build", "index.html"));
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };
// connect();
