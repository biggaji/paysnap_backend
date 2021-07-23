import { db } from "../../configs";

class Auth {
    constructor() {}

    async getAllUsers() {
        let users = await db.query(`SELECT * FROM users`);
        return users.rows;
    }

}

export default Auth;