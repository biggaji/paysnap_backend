import { AuthenticationError } from 'apollo-server-express';
import { verify } from 'jsonwebtoken';

async function decodeUser(token:any) {
    try {
        let user = await verify(token, process.env.JWT_SECRET!);
        return user;
    } catch (e) {
        console.log(`Jwt error: An error occured with the identification process `, e);
        throw new AuthenticationError("Invalid or expired jwt token.");
    }
};

export default decodeUser;