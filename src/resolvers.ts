import Auth from './dataSources/auths';
import Transaction from './dataSources/transactions';
import { dateScalar } from "./typedefs";
import { sign } from "jsonwebtoken";
import { encrypt } from "../@utils/encryption";
import Setting from './dataSources/settings';
import { PubSub } from 'graphql-subscriptions';


const auth = new Auth(); 
const transactions = new Transaction();
const settings = new Setting();

let NEW_TRANSACTION = 'NEW_TRANSACTION';

let pubsub = new PubSub();


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

    getTransactions: async (_: any, args: any, ctx: any) => {
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

    checkIfUsernameExist: async (_: any, args: any, ctx: any) => {
      try {
        let { username } = args;
        let user = await auth.checkIfUserExist({ username });
        return user;
      } catch (e) {
        throw e;
      }
    },

    checkIfEmailExist: async (_: any, args: any, ctx: any) => {
      try {
        let { email } = args;
        let user = await auth.checkIfUserExist({ email });
        return user;
      } catch (e) {
        throw e;
      }
    },

    resendActivationCode: async (_: any, args: any, ctx: any) => {
      try {
        let { email } = args;
        let code = await auth.resendActivationCode(email);

        return {
          code: 200,
          success: true,
          message: "Activation token re-sent successfully",
          activation_code: code,
        };
      } catch (e: any) {
        return {
          code: 400,
          success: false,
          message: e.message,
          activation_code: null,
        };
      }
    },

    requestCashRefill: async (_: any, args: any, ctx: any) => {
      try {
        let refilled = await settings.cashRefill(ctx.id);
        return {
          code: 200,
          success: true,
          message: "Cash re-filled successfully",
          refilled,
        };
      } catch (e: any) {
        return {
          code: 400,
          success: false,
          message: e.message,
          refilled: false,
        };
      }
    },

    deleteAccount: async (_: any, args: any, ctx: any) => {
      try {
        let deleted = await settings.deleteAccount(ctx.id);

        return {
          code: 200,
          success: true,
          message: "Account delete successfully",
          deleted,
        };
      } catch (e: any) {
        console.log(e.message);
        return {
          code: 400,
          success: false,
          message: e.message,
          deleted: false,
        };
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
      let user = await auth.activateAccount(args.code, ctx.id);
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

    updateActivationCodeColumnToNull: async (_: any, args: any, ctx: any) => {
      try {
        let updatedCodeColumn = await auth.updateActivationCodeColumnToNull(
          args.email
        );

        let updated = updatedCodeColumn !== null ? true : false;

        return {
          code: 200,
          success: true,
          message: "Code updated to null",
          activation_code: updatedCodeColumn,
          updated,
        };
      } catch (e: any) {
        console.log(e.message);
        return {
          code: 400,
          success: false,
          message: e.message,
          activation_code: null,
          updated: false,
        };
      }
    },

    sendMoney: async (_: any, args: any, ctx: any) => {
      try {
        let transaction = await transactions.sendMoney(args.opts, ctx.id);
        pubsub.publish(NEW_TRANSACTION, {
          newTransaction: transaction,
        });
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
      try {
        let isSet = await auth.setupPin(args.pin, ctx.id);
          return {
            code: 200,
            success: true,
            message: "Pin set successfully",
            isSet
          }
      } catch (e:any) {
        return {
          code: 400,
          success: false,
          message: e.message,
          isSet: false
        };
      }
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
      subscribe: () => pubsub.asyncIterator(NEW_TRANSACTION),
    },
  },

  User: {
    transactions: (_: any, args: any, ctx: any) => {
      return transactions.getUserTransactionsHistory(_.id);
    },
  },
};
  
  export default resolvers;