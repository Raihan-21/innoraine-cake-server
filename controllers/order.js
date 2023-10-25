const { adminPool } = require("../database/admin");

class OrderController {
  async postOrder(req, res) {
    const { items, id_user, nama, no_telp, alamat } = req.body;
    const client = await adminPool.connect();
    try {
      await client.query("BEGIN");
      let total_harga = 0;
      items.forEach((item) => {
        // console.log(item.harga);
        // console.log(item.jumlah);
        total_harga += Number(item.harga) * Number(item.jumlah);
      });
      const addOrder = await client.query(
        "INSERT INTO orders(id_user, nama, no_telp, alamat, total_harga, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [id_user, nama, no_telp, alamat, total_harga, "pending"]
      );
      console.log(addOrder);
      for (const item of items) {
        // try {
        const cartRes = await client.query(
          "SELECT * FROM keranjang WHERE id = $1",
          [item.id]
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
      }
      await client.query("COMMIT");
      res.json({ body: { message: "success", data: addOrder.rows[0] } });
    } catch (error) {
      await client.query("ROLLBACK");
      res.status(500).json({ error });
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
  async getOrder(req, res) {
    const { id_user } = req.query;
    try {
      const queryString =
        "SELECT orders.*, row_to_json(users) as users, array_agg(row_to_json(order_item)) as order_item FROM orders JOIN users ON orders.id_user = users.id JOIN order_item ON order_item.id_order = orders.id WHERE orders.id_user = $1 GROUP BY orders.id, users.*";
      const queryValues = [id_user];
      const query = await adminPool.query(queryString, queryValues);
      res.json({ body: query.rows });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async getOrderDetail(req, res) {
    const { id } = req.params;
    try {
      const queryString =
        "SELECT order_item.*, row_to_json(produk) as produk FROM order_item JOIN produk ON order_item.id_produk = produk.id WHERE order_item.id_order = $1";
      const queryValues = [id];
      const orderQuery = await adminPool.query(
        "SELECT * FROM orders WHERE id = $1",
        queryValues
      );
      const query = await adminPool.query(queryString, queryValues);
      const totalHarga = query.rows.reduce(
        (acc, curr) => acc + Number(curr.harga) * Number(curr.jumlah),
        0
      );
      res.json({
        body: {
          items: query.rows,
          detail: { ...orderQuery.rows[0], total_harga: totalHarga },
        },
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async getOrders(req, res) {
    try {
      const querystring = "SELECT * FROM orders";
      const query = await adminPool.query(querystring);
      res.json({ body: query.rows });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
  async toggleOrder(req, res) {
    const { id, confirm } = req.body;
    const status = confirm === 1 ? "paid" : "pending";
    try {
      const queryString =
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *";
      const queryValues = [status, id];
      const query = await adminPool.query(queryString, queryValues);
      res.json({ body: query.rows[0] });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }
  async deletOrder(req, res) {
    const { id } = req.params;
    try {
      const queryString = "DELETE FROM orders WHERE id = $1 RETURNING *";
      const queryValues = [id];
      const query = await adminPool.query(queryString, queryValues);
      res.json({ body: query.rows[0] });
    } catch (error) {
      res.json({ error });
    }
  }
}

const orderService = new OrderController();

module.exports = orderService;
