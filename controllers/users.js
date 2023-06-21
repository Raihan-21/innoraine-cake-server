const ProductController = require("./products");

const adminPool = require("../database/admin");

const productService = new ProductController();
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
      const queryString =
        "INSERT INTO keranjang(id_user, id_produk, jumlah, harga) VALUES($1, $2, $3, $4) RETURNING *";
      const queryValues = [id_user, id_produk, jumlah, harga];
      const query = await client.query(queryString, queryValues);
      await client.query("COMMIT");
      res.json({ body: query.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ error });
    } finally {
      client.release();
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
        (accumulator, currValue) => accumulator + currValue.harga,
        0
      );
      res.json({ body: { data: query.rows, total_harga: totalHarga } });
    } catch (error) {
      res.json({ error });
    }
  }
}

module.exports = UserController;
