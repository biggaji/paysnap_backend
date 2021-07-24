import { db } from "../../configs";
import { SendMoneyOptions } from '../../types/transactions_types';

class Transaction {
  constructor() {}

  async getUsersTransactionsHistory(id:any) {
    let transactions = await db.query(`SELECT * FROM transactions WHERE senderid = $1`, [id]);
    return transactions.rows;
  }
  async sendMoney(opts:SendMoneyOptions, senderid:string) {
    // the amount should be converted to  a number first
    // check senders account balance for sufficent funds
    // if enough send, else throw error "insufficent funds" update status to failed

    // let initializeTransaction = await db.query(`INSERT INTO `)
    // After sending , update both users account balance
    // sender balance - amount 
    // receiver balance + amount
    // update status to successful
  }
}

export default Transaction;
