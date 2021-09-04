import { db } from "../../configs";
import { updatePasswordOpts, updatePinOpts } from "../../types/settings_types";

class Setting {
  constructor() {}

  // updateUsername(newusername: string, id: string) {}

  async updatePassword(opts: updatePasswordOpts, id:string) {}

  async updatePin(opts: updatePinOpts, id:string) {}

  async updateAvatar(avatarUrl:string, id:string) {
    try {
      let avatar = await db.query(
        `UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar`,
        [avatarUrl, id]
      );
      return avatar.rows[0];
    } catch (error) {
      return error;
    }
  }
}

export default Setting;