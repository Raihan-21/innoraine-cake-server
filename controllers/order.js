const { adminPool } = require("../database/admin");

class OrderController {
  async postOrder(req, res) {
    const { items, id_user, nama, no_telp, alamat } = req.body;
    const client = await adminPool.connect();
    try {
      await client.query("BEGIN");
      const addOrder = await client.query(
        "INSERT INTO orders(id_user, nama, no_telp, alamat, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [id_user, nama, no_telp, alamat, "pending"]
      );
      // console.log(addOrder);
      for (const item of items) {
        // try {
        const cartRes = await client.query(
          "SELECT * FROM keranjang WHERE id = $1",
          [item]
        );
        const cartItem = cartRes.rows[0];
        const values = [
          cartItem.id_produk,
          cartItem.jumlah,
          cartItem.harga,
          addOrder.rows[0].id,
        ];
        const orderItemRes = await client.query(
          "INSERT INTO order_item (id_produk, jumlah, harga, id_order) VALUES($1, $2, $3, $4) RETURNING *",
          values
        );
        const deleteCartRes = await client.query(
          "DELETE FROM keranjang WHERE id = $1 RETURNING *",
          [cartItem.id]
        );
        console.log(deleteCartRes.rows[0]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    // const {}
    // try {
    //   const client = await adminPool.connect();
    //   (await client).query("BEGIN");
    //   const queryString =
    // "INSERT INTO order (id_user, nama, no_telp, alamat) VALUES ($1, $2, $3, $4)";
    //   const res = await client.query;
    // } catch (error) {}
  }
  async getOrders(req, res) {
    const { id_user } = req.body;
    try {
      const queryString =
        "SELECT order.*, row_to_json(users) as users  FROM order JOIN users ON order.id_user = users.id WHERE order.id_user = $1";
      const queryValues = [id_user];
      const query = await adminPool.query(queryString, queryValues);
      res.json({ body: query.rows });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }
}

const orderService = new OrderController();

module.exports = orderService;
