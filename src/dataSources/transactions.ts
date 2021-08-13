import { UserInputError } from "apollo-server-errors";
import getTodaysDate from "../../@utils/dateFormatter";
import getMonth from "../../@utils/monthFormatter";
import getFirstDayOfTheWeek from "../../@utils/weekFormatter";
import { db } from "../../configs";
import { SendMoneyOptions, CalendarOpts } from '../../types/transactions_types';

class Transaction {
  constructor() {}

  async getUserTransactionsHistory(id: any) {
    let transactions = await db.query(
      `SELECT * FROM transactions WHERE senderid  = $1 ORDER BY transactedat DESC`,
      [id]
    );
    return transactions.rows;
  };

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
      } else if(amount <= "0"){
        throw new UserInputError(
          "You can only send any amount greater than 0!"
        );
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
      `SELECT * FROM transactions WHERE id = $1 ORDER BY transactedat DESC`,
      [transactionId]
    );
    return transaction;
  }

  async getTodayTransactions(userId:string) {
    let todayDate = await getTodaysDate();
    try {
      let todayTransaction = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') = $2 ORDER BY transactedat DESC
      `,
        [userId, todayDate]
      );
      return todayTransaction.rows;
    } catch (error) {
      console.log(error)
      return error;
    }
  }

  async getThisWeekTransactions(userId:string) {
    // That weeks monday to present day
    let firstDateOfTheWeek = await getFirstDayOfTheWeek();
    let todayDate = await getTodaysDate();

    try {
      let WeeklyTransaction = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $2 AND $3`,
        [userId, firstDateOfTheWeek, todayDate]
      );
      return WeeklyTransaction.rows;
    } catch (error) {
      return error;
    }
  }

  async getThisMonthTransactions(userId:string) {
    // The month start date to present date within month
    let startDate, endDate, month, year;
    year = new Date().getFullYear();
    month = getMonth();
    startDate = `${year}-${month}-01`;
    endDate = await getTodaysDate();

    try {
      let monthlyTransaction =  await db.query(`SELECT * FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $2 AND $3` ,[userId, startDate, endDate]);
      return monthlyTransaction.rows;
    } catch (error) {
      return error;
    }
  }

  async getThisYearTransactions(userId:string) {
    let year = new Date().getFullYear();
    try {
      let yearTransaction = await db.query(`SELECT * FROM transactions WHERE senderid = $1 AND EXTRACT(YEAR FROM transactedat) = $2 ORDER BY transactedat DESC
      `, [userId, year]);
      return  yearTransaction.rows;
    } catch (error) {
      return error;
    }
  }

  async getAllTransactions(userId:string) {
    try {
      let allTransactions = await db.query(`SELECT * FROM transactions WHERE senderid = $1 ORDER BY transactedat DESC`, [userId]);
      return allTransactions.rows;
    } catch (error) {
      return error;
    }
  };

  async getTransaction(limit:number, offset:number, userId:string) {
    try {
      let transaction = await db.query(`SELECT * FROM transactions WHERE senderid = $1 ORDER BY transactedat DESC FETCH FIRST $2 ROWS ONLY OFFSET $3`, [userId, limit, offset]);
      return transaction.rows;
    } catch (error) {
      return error;
    }
  };
};

export default Transaction;
