import { db } from "../../configs";

class Auth {
    constructor() {}

    getAllUsers() {
        return db.query(`SELECT * FROM users`);
    }

}

export default Auth;