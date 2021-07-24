import { db } from "../../configs";
import { CreateAccoutOptions, CheckUserOptions, LoginOptions } from '../../types/auths_types';
import { AuthenticationError } from 'apollo-server';
import bcrypt from 'bcryptjs';

class Auth {
  constructor() {}

  async getAllUsers() {
    let users = await db.query(`SELECT * FROM users`);
    return users.rows;
  }

  async createAccount(opts: CreateAccoutOptions) {
      let {fullname, email, username, country , password } = opts!;
    // first check if user exist this.checkUserexist(email)

    let user = await this.checkIfUserExist({ email });
    console.log(user)

    if(user && user !== null) {
        throw new AuthenticationError("User alreadly exist, please signin instead!");
    }

    // hash password and sign with jwt
    let hashedPassword = await bcrypt.hash(password, 10);

    let newUser = await db.query(`INSERT INTO users (fullname, email, username, country, password) VALUES ($1,$2,$3,$4,$5) RETURNING *`, 
    [fullname , email, username, country, hashedPassword]);

    // hash jwt
    return newUser.rows[0];
    // send activation token
    // if  not exist throw error else insert user data and send activation token
  }

  async login(opts: LoginOptions) {
    // first check if user exist this.checkUserexist(email)
    // if not exist throw error else check if is activated and compare users password with
    // enter one 
    // if correct sign with jwt and return user data
  }

  async checkIfUserExist(opts: CheckUserOptions) {
    // Takes either an email or username
    let user;
    if(opts.username !== undefined) {
        user = await db.query(`SELECT username FROM users WHERE username = $1`, [opts.username]);
        if(user.rowCount >= 1 ) {
            return user.rows[0].username;
        }
        return null;
    } else if(opts.email !== undefined) {
        user = await db.query(`SELECT email FROM users WHERE email = $1`, [
          opts.email,
        ]);

        if(user.rowCount >= 1) {
            return user.rows[0].email;
        }
        return null;
    } else {
        return null;
    }
    // runs deferent query based on the option passed
    // if exist throw error, else return data
  }

  async activateAccount(token: string) {
    // check token passed and validate with the one stored
    // if correct, update column to true
  }

  async getUserData(opts: any) {
    // first check if user exist this.checkUserexist(email)
    // if exist throw error else inser user data and send activation token
  }
}

export default Auth;