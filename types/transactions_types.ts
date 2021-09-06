export interface SendMoneyOptions {
    receiverUsername: string,
    amount: string,
    pin:number
}

export type CalendarOpts =  "week" | "today" | "year" | "month" | "all";