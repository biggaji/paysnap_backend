import { db } from "../../configs";

class Auth {
  constructor() {}

  async getAllUsers() {
    let users = await db.query(`SELECT * FROM users`);
    return users.rows;
  }

  async createAccount(options: any) {
    // first check if user exist this.checkUserexist(email)
    // if  not exist throw error else insert user data and send activation token
  }

  async login(options: any) {
    // first check if user exist this.checkUserexist(email)
    // if not exist throw error else check if is activated and compare users password with
    // enter one 
    // if correct sign with jwt and return user data
  }

  async checkIfUserExist(options: any) {
    // Takes either an email or username
    // runs deferent query based on the option passed
    // if exist throw error, else return data
  }

  async activateAccount(options: any) {
    // check token passed and validate with the one stored
    // if correct, update column to true
  }

  async getUserData(options: any) {
    // first check if user exist this.checkUserexist(email)
    // if exist throw error else inser user data and send activation token
  }
}

export default Auth;