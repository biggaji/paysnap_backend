import Auth from './dataSources/auths';
import Transaction from './dataSources/transactions';
import { dateScalar } from "./typedefs";
import { sign } from "jsonwebtoken";
import { encrypt } from "../@utils/encryption";


const auth = new Auth();
const transactions = new Transaction();

const resolvers = {
  Date: dateScalar,
  Query: {
    getUser: () => {
      return auth.getAllUsers();
    },
    getAUser: (_: any, args: any) => {
      return auth.getAUserById(args.id);
    },
    me: (_: any, args: any, ctx: any) => {
      return auth.getAUserById(ctx.id);
    },
    login: async (_: any, args: any) => {
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
        token,
      };
    },
    
    getTransaction: async (_: any, args: any, ctx: any, info:any) => {
      // console.log("Info: ", info);golden for pagnation

      try {
        let transact = await transactions.getTransactions(
          args.opts.limit,
          args.opts.offset,
          ctx.id,
          args.opts.calOpts
        );
        console.log(transact);
        // console.log(transact.length);

        
        let cursorHash = transact[transact.length - 1].transactedat;
        console.log(encrypt(cursorHash));

        let allTransact = await transactions.countTransaction(
          ctx.id,
          args.opts.calOpts
        );
        // console.log(allTransact);

        console.log(`Count: `, allTransact[0].count);

        return {
          transactions: transact,
          hasNextpage:true,
          cursor: cursorHash
        }
      } catch (error) {
        return {
          transactions: null,
          hasNextpage: false,
          cursor: null
        }
      }
    },
  },

  Mutation: {
    createAccount: async (_: any, args: any) => {
      let userCreated = await auth.createAccount(args.opts);

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
          token,
        };
      } catch (e) {
        return {
          code: 400,
          success: false,
          message: e.message,
          user: null,
          token: null,
        };
      }
    },
    activateAccount: async (_: any, args: any, ctx: any) => {
      let user = await auth.activateAccount(args.token, ctx.id);
      try {
        return {
          code: 200,
          success: true,
          message: "Account activated",
          user: user,
        };
      } catch (e) {
        return {
          code: 400,
          success: false,
          message: "Account not activated",
          user: null,
        };
      }
    },
    sendMoney: async (_: any, args: any, ctx: any) => {
      try {
        let transaction = await transactions.sendMoney(args.opts, ctx.id);
        return {
          code: 200,
          success: true,
          message: "Transaction Successfull",
          transaction,
        };
      } catch (e) {
        return {
          code: 400,
          success: false,
          message: e.message,
          transaction: null,
        };
      }
    },
    setupPin: async (_:any, args:any, ctx:any) => {
      return auth.setupPin(args.pin,ctx.id);
    }
  },

  User: {
    transactions: (_: any, args: any, ctx: any) => {
      return transactions.getUserTransactionsHistory(_.id);
    },
  },
};

export default resolvers;