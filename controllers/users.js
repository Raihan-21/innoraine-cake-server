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
}

module.exports = UserController;
