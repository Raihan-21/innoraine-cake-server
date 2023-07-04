const adminPool = require("../database/admin");
const { sqlConditionGenerator } = require("../helpers/helpers");

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
    const { id_kategori, search } = req.query;
    const query = {
      "produk.id_kategori": id_kategori,
    };
    const searchQuery = {
      "produk.nama_produk": search,
    };
    // const searchValue = search;
    const { queryCondition, queryValues } = sqlConditionGenerator(
      query,
      searchQuery
    );
    try {
      const queryString =
        "SELECT produk.*, row_to_json(kategori) as kategori FROM produk JOIN kategori ON produk.id_kategori = kategori.id " +
        queryCondition;
      // console.log(queryString);
      const query = await adminPool.query(queryString, queryValues);

      res.json({ body: query.rows });
    } catch (error) {
      res.json({ error });
    }
  }

  async getDetail(req, res) {
    const { id } = req.params;
    try {
      const queryString =
        "SELECT produk.*, row_to_json(kategori) as kategori from produk JOIN kategori ON produk.id_kategori = kategori.id JOIN gambar_produk ON produk.id = gambar_produk.id_produk WHERE produk.id = $1";
      const values = [id];
      const query = await adminPool.query(queryString, values);
      res.json({ body: query.rows[0] });
    } catch (error) {
      res.status(500).json({ error });
      throw error;
    }
  }
  async getProductImages(req, res) {
    const { id } = req.params;
    const queryString = "SELECT * from gambar_produk WHERE id_produk = $1";
    const values = [id];
    try {
      const query = await adminPool.query(queryString, values);
      res.json({ body: query.rows });
    } catch (error) {
      res.status(500).json({ error });
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

  async updateItem(client, id, jumlah) {
    const queryString = "UPDATE produk SET stok = stok - $1 WHERE id = $2";
    const queryValues = [jumlah, id];
    try {
      const res = await client.query(queryString, queryValues);
      return res;
    } catch (error) {
      throw error;
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

const productService = new ProductController();
module.exports = productService;
