import { db } from "../../configs";
import { SendMoneyOptions } from '../../types/transactions_types';

class Transaction {
  constructor() {}

  async getUsersTransactionsHistory(id:any) {
    let transactions = await db.query(`SELECT * FROM transactions WHERE senderid = $1`, [id]);
    return transactions.rows;
  }
  async sendMoney(opts:SendMoneyOptions, senderid:string) {
    let { amount, receiverUsername } = opts;
    // let UpdatetransactionStatus; 
    // let transfer;

    // the amount should be converted to  a number first
    // check senders account balance for sufficent funds
    // get receipent id by username
    let receipentId = await (await db.query(`SELECT id FROM users WHERE username = $1`, [receiverUsername])).rows[0].id; 

    let sender_acct_balance = await (await db.query(`SELECT accountbalance FROM users WHERE id = $1`, [senderid])).rows[0].accountBalance;
    let receipent_acct_balance = await(
      await db.query(`SELECT accountbalance FROM users WHERE id = $1`, [
        receipentId,
      ])
    ).rows[0].accountBalance;

    
    // if enough send, else throw error "insufficent funds" update status to failed
    if(sender_acct_balance > amount) {
     let transfer = await (await db.query(`INSERT INTO transactions (amount, senderid, receiverid)
      VALUES($1,$2,$3) RETURNING *`,[amount, senderid, receipentId ])).rows[0];

      // subtract amount sent from senders account balance and return remaining
      sender_acct_balance = sender_acct_balance - Number(amount);
      
      // update senders account balance
      let updateSendersAccountBalance = await db.query(`UPDATE users SET accountbalance = $1 WHERE id = $2`, [sender_acct_balance, senderid]);

      receipent_acct_balance = receipent_acct_balance + Number(amount);

      let updatereceipentAccountBalance = await db.query(`UPDATE users SET accountbalance = $1 WHERE id = $2`, [receipent_acct_balance, receipentId]);

      // update transaction_status to successful
      let UpdatetransactionStatus = await db.query(`UPDATE transactions SET transactionstatus = $1 WHERE id = $2`, ['successful', transfer.id]);

      // return transfer data
      return transfer;
    } else {
      let failedtransfer = await (await db.query(`INSERT INTO transactions (amount, senderid, receiverid)
      VALUES($1,$2,$3) RETURNING *`,[amount, senderid, receipentId ])).rows[0];

      let UpdatetransactionStatus = await db.query(
        `UPDATE transactions SET transactionstatus = $1 WHERE id = $2`,
        ["failed", failedtransfer.id]
      );

      return failedtransfer;
    }

    // let initializeTransaction = await db.query(`INSERT INTO `)
    // After sending , update both users account balance
    // sender balance - amount 
    // receiver balance + amount
    // update status to successful
  }

  retryTransaction() {
    
  }
}

export default Transaction;
