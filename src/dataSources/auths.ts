import { db } from "../../configs";
import { CreateAccoutOptions, CheckUserOptions, LoginOptions, ActivateAccountOptions } from '../../types/auths_types';
import generateActivationCode from '../../@utils/generateActivationCode';
import { AuthenticationError } from 'apollo-server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

class Auth {
  constructor() {}

  async getAllUsers() {
    let users = await db.query(`SELECT * FROM users`);
    return users.rows;
  }

  async createAccount(opts: CreateAccoutOptions) {
    let { fullname, email, username, country , password } = opts!;
    
    // first check if user exist using this.checkUserexist(email)
    let user = await this.checkIfUserExist({ email });

    if(user && user !== null) {
        throw new AuthenticationError("User alreadly exist, please signin instead!");
    }

    // hash password
    let hashedPassword = await bcrypt.hash(password, 10);

    // insert into database
    let newUser = await db.query(`INSERT INTO users (fullname, email, username, country, password) VALUES ($1,$2,$3,$4,$5) RETURNING *`, 
    [fullname , email, username, country, hashedPassword]);

    // send activation token using mailgun
    let activationCode = generateActivationCode();

    // nodemailer configs

    let mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.MAIL}`,
        pass: `${process.env.MAIL_PASSWORD}`
      }
    });

    const msg = {
      from: `${process.env.MAIL}`,
      to: newUser.rows[0].email,
      subject: "Activate Your Paysnap Account Now",
      html: `<html>
            <body>
            <h1>Welcome to paysnap!</h1>
            <br>
            <p>You’re just one click away from getting started with Paysnap.
             All you need to do is activate your Paysnap account with the code below.</p>
             <br>
                  <p>${activationCode}</p>
             <br>
             <p>Once your account is activated, you can start sending cash to your loved one's using Paysnap.</p>
              <br>
              <p>You’re receiving this email because you recently created a new Paysnap account.
               If this wasn’t you, please ignore this email.</p>
               </body>
               </html>
        `,
    };

    mailTransport.sendMail(msg, (err,res) => {
      if(err) {
        console.log(err);
      } else {
        console.log(`Mail sent`, res.response);
      }
    });


    // return output
    return newUser.rows[0];
  }
  async login(opts: LoginOptions) {
    let { username, password } = opts;


    // first check if user exist this.checkUserexist(email)
    let user = await this.checkIfUserExist({username})
    console.log(user);

    // if not exist throw error else check if is activated and compare users password with
    if(user && user !== null) {
      // query password from database
      let passW = await db.query(`SELECT password FROM users WHERE username = $1`, [username]);
      // compare password with the one in the database
      let checkPassword = await bcrypt.compare(password, passW.rows[0].password);
      if(checkPassword) {
        // return data
        return await this.getUserData({username});
      } else {
        throw new AuthenticationError("Incorrect Credentials!, try again.")
      }

    } else {
      // not a user
       throw new AuthenticationError("You are not a registered user, please register first!");
    }
    return null;
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
  }

  async activateAccount(opts: ActivateAccountOptions) {
    let { token, email } = opts;
    // check token passed and validate with the one stored

    let dbToken = await db.query(`SELECT verificationtoken FROM users WHERE email = $1`,[email])
    // if correct, update column to true
    dbToken = dbToken.rows[0].verificationtoken;
    // if(Number(token) === dbToken)
  }

  async getUserData(opts: any) {
    let { username } = opts;
    let user = await db.query(`SELECT * from users WHERE username = $1`, [username]);
    return user.rows[0];
  }
}

export default Auth;