import { db } from "../../configs";
import { updatePasswordOpts, updatePinOpts } from "../../types/settings_types";
import { hash, compare } from 'bcryptjs';
import { ForbiddenError, UserInputError } from "apollo-server-errors";

class Setting {
  constructor() {}

  // updateUsername(newusername: string, id: string) {}

  async updatePassword(opts: updatePasswordOpts, id:string) {

    let { oldpassword, newpassword } = opts;
    let updatedPassword;

    try {

      // fetch current password

      let cPassword:any = await db.query(`SELECT password FROM users WHERE id = $1`, [id]);

      cPassword = cPassword.rows[0].password;
       
      // compare current pin with the old password

      let comparePasswords = await compare(oldpassword, cPassword);

      if(!comparePasswords) {
        throw new UserInputError("The old password you entered is incorrect");
      } else {
        let hashedPassword = await hash(newpassword, 10);
        updatedPassword = await db.query(`UPDATE users SET password = $1 WHERE id = $2 RETURNING password`, [hashedPassword, id]);
        return (updatedPassword.rows[0].password !== null) ? true : false;
      }

    } catch (e) {
      throw e;
    }
  }

  async updatePin(opts: updatePinOpts, id:string) {
    let oPin:any, nPin:any;
    let pinUpdate;

    try {
      let { oldpin, newpin } = opts;
       oPin = oldpin.toString();
       nPin = newpin.toString();

      //  fetch current pin from database
      let currentPin:any = await db.query(`SELECT pin from users WHERE id = $1`, [id]);

      currentPin = currentPin.rows[0].pin;

      let comparePins = await compare(oPin, currentPin);

      if(!comparePins) {
        throw new UserInputError("The old pin you entered is incorrect");
      } else {
        let hashedPin = await hash(nPin, 10);
        pinUpdate = await db.query(
          `UPDATE users SET pin = $1 WHERE id = $2 RETURNING pin`,
          [hashedPin, id]
        );
      }

      return (pinUpdate.rows[0].pin !== null) ? true : false;
    } catch (e) {
      throw e;
    }
  }

  async updateAvatar(avatarUrl:string, id:string) {
    try {
      let avatar = await db.query(
        `UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar`,
        [avatarUrl, id]
      );
      return avatar.rows[0];
    } catch (e) {
      throw e;
    }
  }

  async cashRefill(id:string) {
    try {
      let refill;
      let currentBalance:any = await db.query(`SELECT accountbalance FROM users WHERE id = $1`, [id]);

      currentBalance = currentBalance.rows[0].accountbalance;

      if(currentBalance > 0 ) {
        throw new ForbiddenError("Your account balance has to be 0 before you can refill");
      } else {
        currentBalance += 100000;
        
        refill = await db.query(`UPDATE users SET accountbalance = $1 WHERE id = $2 RETURNING accountbalance`, [currentBalance, id]);
      }

      return (refill.rows[0].accountbalance !== null) ? true : false;
    } catch (e) {
      throw e;
    }
  }
}

export default Setting;