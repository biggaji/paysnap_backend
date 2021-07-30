import Auth from './dataSources/auths';
import Transaction from './dataSources/transactions';
import { dateScalar } from "./typedefs";
import { sign } from "jsonwebtoken";


const auth = new Auth();
const transactions = new Transaction();

const resolvers = {
    Date: dateScalar,
    Query: ({
        getUser: () => {
            return auth.getAllUsers();
        },
        login: async (_:any, args:any) => {
            let user = await auth.login(args.opts);
            let token = await sign(
              {
                username: user.username,
                id: user.id,
                email: user.email,
              },
              process.env.JWT_SECRET!,
              { expiresIn: "1h" }
            );
            return {
                user,
                token
            }
        }
    }),

    Mutation: ({
        async createAccount(_:any, args:any) {
            let  userCreated = await auth.createAccount(args.opts);

            let token = await sign(
            {
                username: userCreated.username,
                id: userCreated.id,
                email: userCreated.email,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
            );
            
            try {
                return {
                    code: 200,
                    success: true,
                    message: "Account created successfully",
                    user: userCreated,
                    token
                }
            } catch (e) {
                return {
                  code: e.extensions.response.status,
                  success: false,
                  message: e.extensions.response.body,
                  user: null,
                  token: null
                };
            }
        },
        activateAccount: async (_:any, args:any, ctx:any) => {    
            try {
                let token = await auth.activateAccount(args.token, ctx.user.email);
                console.log(token, " Resolver");
                return {
                    code: 200,
                    sucess: true,
                    message: "Account activated",
                    user: null
                }
            } catch (e) {
                return {
                  code: 400,
                  sucess: false,
                  message: "Account not activated",
                  user: null,
                };
            }
        }
    }),

    User: ({
        transactions: (_:any, args:any, ctx:any) => {
            return transactions.getUsersTransactionsHistory(_.id);
        }
    }),
}

export default resolvers;