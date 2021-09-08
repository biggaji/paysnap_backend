import Auth from './dataSources/auths';
import Transaction from './dataSources/transactions';
import { dateScalar } from "./typedefs";
import { sign } from "jsonwebtoken";
import { encrypt } from "../@utils/encryption";
import Setting from './dataSources/settings';
import { GooglePubSub } from '@axelspringer/graphql-google-pubsub';
import { PubSub as gsPub } from 'graphql-subscriptions';

const auth = new Auth();
const transactions = new Transaction();
const settings = new Setting();

const NEW_TRANSACTION = "projects/ps-notify-325410/topics/NEW_TRANSACTION";
// let NEW_TRANSACTION = 'NEW_TRANSACTION';
const pubsub = new GooglePubSub();


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

    getTransactions: async (_: any, args: any, ctx: any, info: any) => {
      try {
        let transact: any = await transactions.getTransactions(
          args.opts.limit,
          ctx.id,
          args.opts.calOpts
        );

        let allTransactCount: any = await transactions.countTransaction(
          ctx.id,
          args.opts.calOpts
        );
        let cursor, hasNextPage, cursorHash;
        if (transact.length > 1) {
          cursorHash = encrypt(transact[transact.length - 1].transactedat);
          // console.log(cursorHash);
        }
        if (transact && transact.length < allTransactCount) {
          hasNextPage = true;
          cursor = cursorHash;
        } else {
          hasNextPage = false;
          cursor = "";
        }
        return {
          transactions: transact,
          hasNextPage,
          cursor,
        };
      } catch (error) {
        console.log(error);
        return {
          transactions: null,
          hasNextpage: null,
          cursor: null,
        };
      }
    },

    getNextTransactions: async (_: any, args: any, ctx: any) => {
      // "
      try {
        let transact: any = await transactions.getTransactions(
          args.limit,
          ctx.id,
          args.calOpts,
          args.after
        );
        let remainingTransactionCount: any =
          await transactions.countTransaction(ctx.id, args.calOpts, args.after);
        let cursor, hasNextPage, cursorHash;
        if (transact.length > 1) {
          cursorHash = encrypt(transact[transact.length - 1].transactedat);
          // console.log(cursorHash);
        }
        if (transact && transact.length < remainingTransactionCount) {
          hasNextPage = true;
          cursor = cursorHash;
        } else {
          hasNextPage = false;
          cursor = "";
        }
        return {
          transactions: transact,
          hasNextPage,
          cursor,
        };
      } catch (error) {
        console.log(error);
        return {
          transactions: null,
          hasNextpage: null,
          cursor: null,
        };
      }
      // "
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
      } catch (e: any) {
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
      } catch (e: any) {
        return {
          code: 400,
          success: false,
          message: e.message,
          user: null,
        };
      }
    },

    updatePassword: async (_: any, args: any, ctx: any) => {
      try {
        let passwordUpdated = await settings.updatePassword(args.opts, ctx.id);
        return {
          code: 200,
          success: true,
          message: "Password updated successfully",
          passwordUpdated,
        };
      } catch (e: any) {
        return {
          code: 400,
          success: false,
          message: e.message,
          passwordUpdated: false,
        };
      }
    },

    sendMoney: async (_: any, args: any, ctx: any) => {
      try {
        let transaction = await transactions.sendMoney(args.opts, ctx.id);
        pubsub.publish(
          NEW_TRANSACTION,
          {
            newTransaction: transaction,
          }
        );
        return {
          code: 200,
          success: true,
          message: "Transaction Successfull",
          transaction,
        };
      } catch (e: any) {
        return {
          code: 400,
          success: false,
          message: e.message,
          transaction: null,
        };
      }
    },

    setTransactionPin: async (_: any, args: any, ctx: any) => {
      return auth.setupPin(args.pin, ctx.id);
    },

    updateTransactionPin: async (_: any, args: any, ctx: any) => {
      try {
        let pinUpdated = await settings.updatePin(args.opts, ctx.id);
        return {
          code: 200,
          success: true,
          message: "Transaction pin updated successfully",
          pinUpdated,
        };
      } catch (e: any) {
        // console.log(`Update Transaction Pin error`, e);
        return {
          code: 400,
          success: false,
          message: e.message,
          pinUpdated: false,
        };
      }
    },

    addAvatar: async (_: any, args: any, ctx: any) => {
      try {
        let avatar = await auth.uploadAvatar(args.avatarUrl, ctx.id);
        return {
          code: 200,
          success: true,
          message: "Avatar uploaded successfully",
          avatar,
        };
      } catch (e: any) {
        console.log("Avatar error: ", e);
        return {
          code: 400,
          success: false,
          message: e.message,
          avatar: null,
        };
      }
    },

    updateAvatar: async (_: any, args: any, ctx: any) => {
      try {
        let avatar = await settings.updateAvatar(args.avatarUrl, ctx.id);
        return {
          code: 200,
          success: true,
          message: "Avatar updated successfully",
          avatar,
        };
      } catch (e: any) {
        console.log("Avatar error: ", e);
        return {
          code: 400,
          success: false,
          message: e.message,
          avatar: null,
        };
      }
    },
  },

  Subscription: {
    newTransaction: {
      subscribe: () =>
        pubsub.asyncIterator(
          NEW_TRANSACTION
        ),
    },
  },

  User: {
    transactions: (_: any, args: any, ctx: any) => {
      return transactions.getUserTransactionsHistory(_.id);
    },
  },
};
  
  export default resolvers;