import { Buffer } from 'buffer';

// encrypt data into base64 binary format
export function encrypt(data:string) {

    let bufStr = Buffer.from(data, "utf8");
    return bufStr.toString("base64");
};

// decrypt hash into a utf8 redable format
export function decrypt(hash: any) {
    let data = Buffer.from(hash, "base64");
    return data.toString("utf8");
};

