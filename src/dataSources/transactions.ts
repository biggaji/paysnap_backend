import { UserInputError } from "apollo-server-errors";
import { db } from "../../configs";
import { SendMoneyOptions } from '../../types/transactions_types';

class Transaction {
  constructor() {}

  async getUserTransactionsHistory(id: any) {
    let transactions = await db.query(
      `SELECT * FROM transactions WHERE senderid = $1`,
      [id]
    );
    return transactions.rows;
  }
  async sendMoney(opts: SendMoneyOptions, senderid: string) {
    try {
      let { amount, receiverUsername } = opts;

      // get receipent id by username
      let receipentId = await db.query(
        `SELECT id FROM users WHERE username = $1`,
        [receiverUsername]
      );

      receipentId = receipentId.rows[0].id;

      let sender_acct_balance: any = await db.query(
        `SELECT accountbalance FROM users WHERE id = $1`,
        [senderid]
      );

      sender_acct_balance = sender_acct_balance.rows[0].accountbalance;

      let receipent_acct_balance: any = await db.query(
        `SELECT accountbalance FROM users WHERE id = $1`,
        [receipentId]
      );

      receipent_acct_balance = receipent_acct_balance.rows[0].accountbalance;

      // if enough send, else throw error "insufficent fund"
      if (sender_acct_balance >= amount && amount > "0") {
        let transfer: any = await db.query(
          `INSERT INTO transactions (amount, senderid, receiverid)
        VALUES($1,$2,$3) RETURNING *`,
          [amount, senderid, receipentId]
        );

        transfer = transfer.rows[0];

        // subtract amount sent from senders account balance and return remaining
        sender_acct_balance = sender_acct_balance - Number(amount);

        // update senders account balance
        let updateSendersAccountBalance = await db.query(
          `UPDATE users SET accountbalance = $1 WHERE id = $2`,
          [sender_acct_balance, senderid]
        );

        receipent_acct_balance = receipent_acct_balance + Number(amount);

        let updatereceipentAccountBalance = await db.query(
          `UPDATE users SET accountbalance = $1 WHERE id = $2`,
          [receipent_acct_balance, receipentId]
        );

        // update transaction_status to successful
        let UpdatetransactionStatus = await db.query(
          `UPDATE transactions SET transactionstatus = $1 WHERE id = $2`,
          ["successful", transfer.id]
        );

        // return transfer data
        transfer = await this.getTransactionById(transfer.id);

        return transfer.rows[0];
      } else {
        throw new UserInputError(
          "You account balance is insufficent for this transaction!"
        );
      }
    } catch (e) {
      //an error occured
      throw e;
    }
  }

  retryTransaction() {}

  async getTransactionById(transactionId: string) {
    let transaction = await db.query(
      `SELECT * FROM transactions WHERE id = $1`,
      [transactionId]
    );
    return transaction;
  }

  async getTodayTransactions(userId:string, date:string) {}

  async getThisWeekTransactions(userId:string, startDate:string, endDate:string) {}

  async getThisMonthTransactions(userId:string, startDate:string, endDate:string) {}

  async getThisYearTransactions(userId:string, year:string) {}

  async getAllTransactions(userId:string) {
    try {
      let allTransactions = await (await db.query(`SELECT * FROM transactions WHERE senderid = $1 ORDER BY transactedat`, [userId])).rows;
      return allTransactions;
    } catch (error) {
      return error;
    }
  };

  async getTransaction(limit:number, offset:number, userId:string) {
    try {
      let transaction = await db.query(`SELECT * FROM transactions WHERE senderid = $1 ORDER BY transactedat FETCH FIRST $2 ROWS ONLY OFFSET $3`, [userId, limit, offset]);
      return transaction.rows;
    } catch (error) {
      return error;
    }
  };
};

export default Transaction;
