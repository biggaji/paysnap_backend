import Auth from './dataSources/auths';
import Transaction from './dataSources/transactions';
import { dateScalar } from "./typedefs";

const auth = new Auth();
const transactions = new Transaction();

const resolvers = {
    Date: dateScalar,
    Query: ({
        getUser: () => {
            return auth.getAllUsers();
        }
    }),

    User: ({
        transactions: (_:any, args:any, ctx:any) => {
            return transactions.getUsersTransactionsHistory(_.id);
        }
    }),
}

export default resolvers;