const { adminPool } = require("../database/admin");

class OrderController {
  async postOrder(req, res) {
    const { items, id_user, nama, no_telp, alamat } = req.body;

    const addOrder = await adminPool.query(
      "INSERT INTO order(id_user, nama, no_telp, alamat) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_user, nama, no_telp, alamat]
    );
    console.log(addOrder);
    for (const item of items) {
      try {
        const cartRes = await adminPool.query(
          "SELECT * FROM keranjang WHERE id = $1",
          [item]
        );
        // console.log(cartRes.rows);
        const cartItem = cartRes.rows[0];
        const values = [
          cartItem.id,
          cartItem.jumlah,
          cartItem.harga,
          addOrder.rows[0].id,
        ];
        const orderItemRes = await adminPool.query(
          "INSERT INTO order_item (id_produk, jumlah, harga, id_order) VALUES($1, $2, $3, $4) RETURNING *",
          values
        );
        console.log(orderItemRes);
      } catch (error) {
        throw error;
      }
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
}

const orderService = new OrderController();

module.exports = orderService;
