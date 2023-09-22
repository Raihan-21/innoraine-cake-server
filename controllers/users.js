const productService = require("./products");

const { adminPool } = require("../database/admin");

// const productService = new ProductController();
class UserController {
  constructor() {}

  /**
   * GET USERS LIST
   *
   * @param {*} req
   * @param {*} res
   */
  async getUsers(req, res) {
    try {
      const queryString =
        "SELECT users.id, users.nama, users.email, users.alamat, row_to_json(roles) as role from users JOIN roles on users.role = roles.id";
      const query = await adminPool.query(queryString);
      res.json({ body: query.rows });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async findUser(email) {
    const queryString = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    try {
      const query = await adminPool.query(queryString, values);
      return query.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async getUserProfile(req, res) {
    const { id } = req.params;
    try {
      const queryString =
        "SELECT nama, email, alamat, no_telp FROM users WHERE id = $1";
      const queryValues = [id];
      const query = await adminPool.query(queryString, queryValues);
      res.json({ body: query.rows[0] });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async addItemToCart(req, res) {
    const client = await adminPool.connect();

    const { id_user, id_produk, jumlah, harga } = req.body;
    try {
      await client.query("BEGIN");
      const updateQuery = await productService.updateItem(
        client,
        id_produk,
        jumlah
      );
      let query = "";
      const findQueryString =
        "SELECT * FROM keranjang WHERE id_user = $1 AND id_produk = $2";
      const findQueryValues = [id_user, id_produk];
      const findQuery = await client.query(findQueryString, findQueryValues);
      if (!findQuery.rowCount) {
        const queryString =
          "INSERT INTO keranjang(id_user, id_produk, jumlah, harga) VALUES($1, $2, $3, $4) RETURNING *";
        const queryValues = [id_user, id_produk, jumlah, harga];
        query = await client.query(queryString, queryValues);
      } else {
        const queryString =
          "UPDATE keranjang SET jumlah = jumlah + $1, harga = harga + $2 WHERE id_user = $3 AND id_produk = $4 RETURNING *";
        const queryValues = [jumlah, harga, id_user, id_produk];
        query = await client.query(queryString, queryValues);
      }
      await client.query("COMMIT");
      res.json({ body: query.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ error });
    } finally {
      client.release();
    }
  }
  async updateCartItem(req, res) {
    const client = await adminPool.connect();
    const { id_user, id_produk, operation } = req.body;
    const operator = operation === "increment" ? "+" : "-";
    try {
      const productQueryString =
        "SELECT produk.*, row_to_json(kategori) as kategori from produk JOIN kategori ON produk.id_kategori = kategori.id JOIN gambar_produk ON produk.id = gambar_produk.id_produk WHERE produk.id = $1";
      const productValues = [id_produk];
      const productQuery = await adminPool.query(
        productQueryString,
        productValues
      );
      await client.query("BEGIN");
      await productService.updateItem(client, id_produk, 1);
      const queryString = `UPDATE keranjang SET jumlah = jumlah ${operator} 1, harga = harga ${operator} $1 WHERE id_produk = $2 AND id_user = $3 RETURNING *`;
      const queryValues = [productQuery.rows[0].harga, id_produk, id_user];
      const query = await adminPool.query(queryString, queryValues);
      await client.query("COMMIT");
      console.log(query);
      res.json({ body: query });
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
    }
  }
  async getCart(req, res) {
    const { id_user } = req.params;
    try {
      const queryString =
        "SELECT keranjang.*, row_to_json(produk) as produk, row_to_json(kategori) as kategori FROM keranjang JOIN produk ON keranjang.id_produk = produk.id JOIN kategori ON produk.id_kategori = kategori.id WHERE keranjang.id_user = $1";
      const queryValues = [id_user];
      const query = await adminPool.query(queryString, queryValues);
      const totalHarga = query.rows.reduce(
        (accumulator, currValue) => accumulator + Number(currValue.harga),
        0
      );
      res.json({ body: { data: query.rows, total_harga: totalHarga } });
    } catch (error) {
      res.json({ error });
    }
  }
}

const userService = new UserController();

module.exports = userService;
