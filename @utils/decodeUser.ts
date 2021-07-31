import { AuthenticationError } from 'apollo-server-errors';
import { verify } from 'jsonwebtoken';

async function decodeUser(token:any) {
    try {
        let user = await verify(token, process.env.JWT_SECRET!);
        if(user) {
            return user;
        } else {
            console.log(`Jwt error: user is null and undefined`);
            return null;
        }
    } catch (e) {
        console.log(`Jwt error: An error occured with the identification process `, e);
        throw new AuthenticationError("Error processing JWT TOKEN");
    }
};

export default decodeUser;