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
              process.env.JWT_SECRET!
            );
            return {
                user,
                token
            }
        }
    }),

    Mutation: ({
        createAccount: async (_:any, args:any) => {
            let  userCreated = await auth.createAccount(args.opts);

            let token = await sign(
            {
                username: userCreated.username,
                id: userCreated.id,
                email: userCreated.email,
            },
            process.env.JWT_SECRET!
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
                  code: 400,
                  success: false,
                  message: e.message,
                  user: null,
                  token: null
                };
            }
        },
        activateAccount: async (_:any, args:any, ctx:any) => {    
            let user = await auth.activateAccount(args.token, ctx.id);
            try {
                return {
                    code: 200,
                    success: true,
                    message: "Account activated",
                    user:user
                }
            } catch (e) {
                return {
                  code: 400,
                  success: false,
                  message: "Account not activated",
                  user: null
                };
            }
        },
        sendMoney: async (_:any, args:any, ctx:any) => {

            try {
                let transaction = await transactions.sendMoney(args.opts, ctx.id);
                return {
                    code:200,
                    success:true,
                    message: "Transaction Successfull",
                    transaction,
                }
            } catch (e) {
                return {
                    code:400,
                    success:false,
                    message:e.message,
                    transaction:null,
                }
            }
        }
    }),

    User: ({
        transactions: (_:any, args:any, ctx:any) => {
            return transactions.getUserTransactionsHistory(_.id);
        }
    }),
}

export default resolvers;