const adminPool = require("../database/admin");

class ProductController {
  constructor() {}

  /**
   * GET PRODUCT LIST
   *
   *
   * @param {*} req
   * @param {*} res
   */

  async getItems(req, res) {
    try {
      const queryString =
        "SELECT produk.*, row_to_json(kategori) as kategori FROM produk JOIN kategori ON produk.id_kategori = kategori.id";
      const query = await adminPool.query(queryString);
      res.json({ body: query.rows });
    } catch (error) {
      res.json({ error });
    }
  }

  async getDetail(req, res) {
    const { id } = req.params;
    try {
      const queryString =
        "SELECT produk.*, row_to_json(kategori) as kategori from produk JOIN kategori ON produk.id_kategori = kategori.id WHERE produk.id = $1";
      const values = [id];
      const query = await adminPool.query(queryString, values);
      res.json({ body: query.rows[0] });
    } catch (error) {
      res.status(500).json({ error });
      throw error;
    }
  }

  /**
   * POST PRODUCT
   *
   *
   * @param {*} req
   * @param {*} res
   */
  async postItem(req, res) {
    const queryString =
      "INSERT INTO produk(nama_produk, id_kategori, deskripsi, harga, stok) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = Object.values(req.body).map((value) => value);
    try {
      const query = await adminPool.query(queryString, values);
      res.json({ body: query.rows[0] });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  /**
   * DELETE PRODUCT
   *
   *
   * @param {*} req
   * @param {*} res
   */

  async deleteItem(req, res) {
    const queryString = "DELETE FROM produk WHERE id = $1";
    const values = [req.params.id];
    try {
      const query = await adminPool.query(queryString, values);
      res.json({ body: query });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
}

module.exports = ProductController;
