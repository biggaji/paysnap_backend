import { db } from "../../configs";
import { updatePasswordOpts, updatePinOpts } from "../../types/settings_types";
import { hash, compare } from 'bcryptjs';
import { UserInputError } from "apollo-server-errors";

class Setting {
  constructor() {}

  // updateUsername(newusername: string, id: string) {}

  async updatePassword(opts: updatePasswordOpts, id:string) {}

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

      let compareOldPin = await compare(oPin, currentPin);

      if(!compareOldPin) {
        return new UserInputError("The old pin is incorrect");
      } else {
        let hashedPin = await hash(nPin, 10);
        pinUpdate = await db.query(
          `UPDATE users SET pin = $1 WHERE id = $2 RETURNING pin`,
          [hashedPin, id]
        );
      }

      return pinUpdate.rows[0].pin !== null ? true : false;
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(avatarUrl:string, id:string) {
    try {
      let avatar = await db.query(
        `UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar`,
        [avatarUrl, id]
      );
      return avatar.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default Setting;