import { db } from "../../configs";
import { CreateAccoutOptions, CheckUserOptions, LoginOptions } from '../../types/auths_types';
import generateActivationCode from '../../@utils/generateActivationCode';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// nodemailer configs

    let mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.MAIL}`,
        pass: `${process.env.MAIL_PASSWORD}`
      }
    });

class Auth {
  constructor() {}

  async getAllUsers() {
    let users = await db.query(`SELECT * FROM users`);
    return users.rows;
  }

  async getAUserById(id:string) {
    let user = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return user.rows[0];
  }

  async createAccount(opts: CreateAccoutOptions) {
    let { fullname, email, username, country , password } = opts!;
    
    // first check if user exist using this.checkUserexist(email)
    let user = await this.checkIfUserExist({ email });

    if(user.email && user.email !== null) {
        throw new AuthenticationError("User alreadly exist, please signin instead!");
    }

    // hash password
    let hashedPassword = await bcrypt.hash(password, 10);

    // insert into database
    let newUser = await db.query(`INSERT INTO users (fullname, email, username, country, password) VALUES ($1,$2,$3,$4,$5) RETURNING *`, 
    [fullname , email, username, country, hashedPassword]);

    // send activation token using mailgun
    let activationCode = generateActivationCode();

    const msg = {
      from: `Paysnap Team <noreply@paysnap.com>`,
      to: newUser.rows[0].email,
      subject: "Activate Your Paysnap Account Now",
      html: `<html>
            <body>
            <h1>Welcome to paysnap!</h1>
            <p>You’re just one click away from getting started with Paysnap.</p>
             All you need to do is activate your Paysnap account with the code below.</p>
                  <p>${activationCode}</p>
             <p>Once your account is activated, you can start sending cash using Paysnap.</p>
              <p>You’re receiving this email because you recently created a new Paysnap account.
               If this wasn’t you, please ignore this email.</p>
               <p>Thanks, <br> The Paysnap Team.</p>
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

    // update verificationtoken column  with auth code

    await db.query(`UPDATE users SET verificationtoken = $1 WHERE id  = $2`, [activationCode, newUser.rows[0].id]);


    // return output
    return newUser.rows[0];
  }

  async login(opts: LoginOptions) {
    let { username, password } = opts;


    // first check if user exist this.checkUserexist(email)
    let user = await this.checkIfUserExist({username})

    // if not exist throw error else check if is activated and compare users password with
    if(user.username && user.username !== null) {
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
  }

  async checkIfUserExist(opts: CheckUserOptions) {
    // Takes either an email or username
    let user;
    
    if(opts.username !== undefined) {
        user = await db.query(`SELECT username FROM users WHERE username = $1`, [opts.username]);
        if(user.rowCount >= 1 ) {
            return user.rows[0];
        }
        return null;
    } else if(opts.email !== undefined) {
        user = await db.query(`SELECT email FROM users WHERE email = $1`, [
          opts.email,
        ]);

        if(user.rowCount >= 1) {
            return user.rows[0];
        }
        return null;
    } else {
        return null;
    }
  }

  async activateAccount(token:string, id:string) {

    // check token passed and validate with the one stored
    let userActivated = await (await db.query(`SELECT isactivated FROM users WHERE id = $1`, [id])).rows[0].isactivated;

    if(userActivated) {
      throw new AuthenticationError("Account is already activated");
    }

    let dbToken:any = await db.query(`SELECT verificationtoken FROM users WHERE id = $1`,[id]);
    // // if correct, update column to true
    dbToken = dbToken.rows[0].verificationtoken;

    if(token === dbToken) {
      //update isActivated to true
      let isActivated = await db.query(`UPDATE users SET isactivated = $1 WHERE id = $2 RETURNING *`,['true', id]);
      
      //set verification token to null
      let verificationToken = await db.query(`UPDATE users SET verificationtoken = $1 WHERE id = $2`, [null, id]);

      return isActivated.rows[0];
    } else {
      throw new UserInputError("Invalid or incorrect token");
    }
  }

  async resendActivationCode(email:string) {
    try {

      let activationCode = generateActivationCode();

      const msg = {
        from: `Paysnap Team <noreply@paysnap.com>`,
        to: email,
        subject: "You're almost there! Just confirm your email",
        html: `<html>
            <body>
            <p>You’re just one click away from getting started with Paysnap.</p>
             All you need to do is activate your Paysnap account with the code below.</p>
                  <p>${activationCode}</p>
             <p>Once your account is activated, you can start sending cash using Paysnap.</p>
              <p>You’re receiving this email because you recently created a new Paysnap account.
               If this wasn’t you, please ignore this email.</p>
               <p>Thanks,<br> The Paysnap Team.</p>
               </body>
               </html>
        `,
      };

      mailTransport.sendMail(msg, (err, res) => {
        if (err) {
          console.log(err.message);
          throw err;
        } else {
          console.log(`Activation code request Mail sent`, res.response);
        }
      });

      // update verificationtoken column  with auth code

      let codeUpdate = await db.query(`UPDATE users SET verificationtoken = $1 WHERE email = $2 RETURNING verificationtoken`, [
        activationCode, email ]);

        return codeUpdate.rows[0].verificationtoken;
    } catch (e) {
      throw e;
    }
  }

  async setupPin(pin:number, id:string) {
    try {
      let transactPin = pin.toString();
      let hashedPin = await bcrypt.hash(transactPin, 10);
      let pinsetup = await db.query(`UPDATE users SET pin = $1 WHERE id = $2 RETURNING pin`, [hashedPin, id]);
      return (pinsetup.rows[0].pin !== null) ? true : false;
    } catch (error) {
      throw error;
    }
  }

  async getUserData(opts: any) {
    let { username } = opts;
    let user = await db.query(`SELECT * from users WHERE username = $1`, [username]);
    return user.rows[0];
  }

  async uploadAvatar(avatarUrl:string, id:string) {
    try {
      let avatar = await db.query(`UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar`, [avatarUrl,id]);
      return avatar.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default Auth;