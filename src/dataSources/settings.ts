import { db } from "../../configs";
import { updatePasswordOpts, updatePinOpts } from "../../types/settings_types";

class Setting {
  constructor() {}

  updateUsername(newusername: string, id: string) {}

  updatePassword(opts: updatePasswordOpts, id:string) {}

  updatePin(opts: updatePinOpts, id:string) {}
}

export default Setting;