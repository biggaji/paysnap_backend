import { UserInputError } from "apollo-server-errors";
import getTodaysDate from "../../@utils/dateFormatter";
import getMonth from "../../@utils/monthFormatter";
import getFirstDayOfTheWeek from "../../@utils/weekFormatter";
import { db } from "../../configs";
import { SendMoneyOptions, CalendarOpts } from '../../types/transactions_types';
import { decrypt } from '../../@utils/encryption';
import { compare } from 'bcryptjs';

class Transaction {
  constructor() {}

  async getUserTransactionsHistory(id: any) {
    let transactions = await db.query(
      `SELECT * FROM transactions WHERE senderid  = $1 ORDER BY transactedat DESC`,
      [id]
    );
    return transactions.rows;
  }

  async sendMoney(opts: SendMoneyOptions, senderid: string) {
    try {
      let { amount, receiverUsername, pin } = opts;

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

      // check transaction pin validity

      let savedPin: any = await db.query(
        `SELECT pin FROM users WHERE id = $1`,
        [senderid]
      );

      savedPin = savedPin.rows[0].pin;

      let incomingPin = pin.toString();

      let pinCheck = await compare(incomingPin, savedPin);

      if (!pinCheck) {
        throw new UserInputError("Incorrect transaction pin");
      }

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
      } else if (amount <= "0") {
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

  async getTransactionById(transactionId: string) {
    let transaction = await db.query(
      `SELECT * FROM transactions WHERE id = $1 ORDER BY transactedat DESC`,
      [transactionId]
    );
    return transaction;
  }

  async getTodayTransactions(userId: string, limit: number, offset: number) {
    let todayDate = await getTodaysDate();
    try {
      let todayTransaction = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') = $2 ORDER BY transactedat DESC FETCH FIRST $3 ROWS ONLY OFFSET $4
      `,
        [userId, todayDate, limit, offset]
      );
      return todayTransaction.rows;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getThisWeekTransactions(userId: string, limit: number, offset: number) {
    // That weeks monday to present day
    let firstDateOfTheWeek = await getFirstDayOfTheWeek();
    let todayDate = await getTodaysDate();

    try {
      let WeeklyTransaction = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $2 AND $3 ORDER BY transactedat DESC
         FETCH FIRST $4 ROWS ONLY OFFSET $5`,
        [userId, firstDateOfTheWeek, todayDate, limit, offset]
      );
      return WeeklyTransaction.rows;
    } catch (error) {
      return error;
    }
  }

  async getThisMonthTransactions(
    userId: string,
    limit: number,
    offset: number
  ) {
    // The month start date to present date within month
    let startDate, endDate, month, year;
    year = new Date().getFullYear();
    month = getMonth();
    startDate = `${year}-${month}-01`;
    endDate = await getTodaysDate();

    try {
      let monthlyTransaction = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $2 
      AND $3 ORDER BY transactedat DESC FETCH FIRST $4 ROWS ONLY OFFSET $5
      `,
        [userId, startDate, endDate, limit, offset]
      );
      return monthlyTransaction.rows;
    } catch (error) {
      return error;
    }
  }

  async getThisYearTransactions(userId: string, limit: number, offset: number) {
    let year = new Date().getFullYear();
    try {
      let yearTransaction = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 AND EXTRACT(YEAR FROM transactedat) = $2 ORDER BY transactedat
       DESC FETCH FIRST $3 ROWS ONLY OFFSET $4
      `,
        [userId, year, limit, offset]
      );
      return yearTransaction.rows;
    } catch (error) {
      return error;
    }
  }

  async getAllTransactions(userId: string, limit: number, offset: number) {
    try {
      let allTransactions = await db.query(
        `SELECT * FROM transactions WHERE senderid = $1 ORDER BY transactedat DESC FETCH FIRST $2 ROWS ONLY OFFSET $3`,
        [userId, limit, offset]
      );
      return allTransactions.rows;
    } catch (error) {
      return error;
    }
  }

  async getTransactions(
    limit: number,
    offset: number,
    userId: string,
    transactionCalendar: CalendarOpts
  ) {
    try {
      let transaction;
      switch (transactionCalendar) {
        case "today":
          transaction = await this.getTodayTransactions(userId, limit, offset);
          break;
        case "week":
          transaction = await this.getThisWeekTransactions(
            userId,
            limit,
            offset
          );
          break;
        case "month":
          transaction = await this.getThisMonthTransactions(
            userId,
            limit,
            offset
          );
          break;
        case "year":
          transaction = await this.getThisYearTransactions(
            userId,
            limit,
            offset
          );
          break;
        case "all":
          transaction = await this.getAllTransactions(userId, limit, offset);
          break;
      }
      return transaction;
    } catch (error) {
      return error;
    }
  }

  // Count all transactions Method for pagination

  async countTodaysTransaction(userId: string, after?: string) {
    let todayDate = await getTodaysDate();
    let todayTransaction;
    try {
      if (after !== undefined) {
        let cursor = decrypt(after);
        todayTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND transactedat < $2 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') = $3`,
          [userId, cursor, todayDate]
        );
      } else {
        todayTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') = $2`,
          [userId, todayDate]
        );
      }
      console.log(todayTransaction.rows[0].count);
      return todayTransaction.rows[0].count;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async countThisWeekTransactions(userId:string, after?:string) {
    // That weeks monday to present day
    let firstDateOfTheWeek = await getFirstDayOfTheWeek();
    let todayDate = await getTodaysDate();
    let WeeklyTransaction;
    try {
      if(after !== undefined) {
        let cursor = decrypt(after);
        WeeklyTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND transactedat = $2 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $3 AND $4`,
          [userId, cursor, firstDateOfTheWeek, todayDate]
        );
      } else {
         WeeklyTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $2 AND $3`,
          [userId, firstDateOfTheWeek, todayDate]
        );
      }
      console.log(WeeklyTransaction)
      return WeeklyTransaction.rows[0].count;
    } catch (error) {
      return error;
    }
  }

  async countThisMonthTransactions(userId:string, after?:string) {
    // The month start date to present date within month
    let startDate, endDate, month, year;
    year = new Date().getFullYear();
    month = getMonth();
    startDate = `${year}-${month}-01`;
    endDate = await getTodaysDate();
    let monthlyTransaction;

    try {
      if(after !== undefined) {
        let cursor = decrypt(after);
        monthlyTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND transactedat < $2 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $3
      AND $4
      `,
          [userId,cursor, startDate, endDate]
        );
      } else {
        monthlyTransaction = await db.query(
         `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND TO_CHAR(transactedat :: DATE, 'yyyy-mm-dd') BETWEEN $2
       AND $3
       `,
         [userId, startDate, endDate]
       );
      }
      return monthlyTransaction.rows[0].count;
    } catch (error) {
      return error;
    }
  }

  async CountThisYearTransactions(userId: string, after?: string) {
    let year = new Date().getFullYear();
    let yearTransaction;
    
    try {
      if (after !== undefined) {
        let cursor = decrypt(after);
        yearTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND transactedat < $2 AND EXTRACT(YEAR FROM transactedat) = $3
      `,
          [userId, cursor, year]
        );
        console.log(`Transaction after: `, yearTransaction.rows);

        // return yearTransaction.rows;
      } else {
        yearTransaction = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND EXTRACT(YEAR FROM transactedat) = $2
      `,
          [userId, year]
        );
      }
      console.log(`Transaction: `, yearTransaction.rows);
      return yearTransaction.rows[0].count;
    } catch (error) {
      return error;
    }
  }

  async countAllTransactions(userId: string, after?:string) {
    let allTransactions;
    try {
      if(after !== undefined) {
        let cursor = decrypt(after);
        allTransactions = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1 AND transactedat < $2`,
          [userId, cursor]
        );
      } else {
         allTransactions = await db.query(
          `SELECT COUNT(id) FROM transactions WHERE senderid = $1`,
          [userId]
        );
      }
      return allTransactions.rows[0].count;
    } catch (error) {
      return error;
    }
  }

  async countTransaction(userId: string, transactionCalendar: CalendarOpts) {
    let transaction;
    try {
      switch (transactionCalendar) {
        case "today":
          transaction = await this.countTodaysTransaction(userId);
          break;
        case "year":
          transaction = await this.CountThisYearTransactions(userId);
          break;
        case "week":
          transaction = await this.countThisWeekTransactions(userId);
          break;
        case "month":
          transaction = await this.countThisMonthTransactions(userId);
          break;
        case "all":
          transaction = await this.countAllTransactions(userId);
          break;
      }
      return transaction;
    } catch (error) {
      return error;
    }
  }
};

export default Transaction;
