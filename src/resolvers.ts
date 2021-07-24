import Auth from './dataSources/auths';
import Transaction from './dataSources/transactions';
import { dateScalar } from "./typedefs";
import { CreateAccoutOptions } from '../types/auths_types';

const auth = new Auth();
const transactions = new Transaction();

const resolvers = {
    Date: dateScalar,
    Query: ({
        getUser: () => {
            return auth.getAllUsers();
        }
    }),

    Mutation: ({
        async createAccount(_:any, args:any) {
            let  userCreated = await auth.createAccount(args.opts);
            try {
                return {
                    code: 200,
                    success: true,
                    message: "User created successfully",
                    user: userCreated
                }
            } catch (e) {
                return {
                  code: e.extensions.response.status,
                  success: false,
                  message: e.extensions.response.body,
                  user: null,
                };
            }
        },
    }),

    User: ({
        transactions: (_:any, args:any, ctx:any) => {
            return transactions.getUsersTransactionsHistory(_.id);
        }
    }),
}

export default resolvers;