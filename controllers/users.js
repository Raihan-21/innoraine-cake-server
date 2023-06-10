const adminPool = require("../database/admin");

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
}

module.exports = UserController;
