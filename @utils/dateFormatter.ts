let date = new Date().getDate();
let month = new Date().getMonth();
let year = new Date().getFullYear();

function getTodaysDate() {
  let formatMonth:string = "0";

    switch (month) {
      case 0:
        formatMonth = "1";
        break;
      case 1:
        formatMonth = "2";
        break;
      case 2:
        formatMonth = "3";
        break;
      case 3:
        formatMonth = "4";
        break;
      case 4:
        formatMonth = "5";
        break;
      case 5:
        formatMonth = "6";
        break;
      case 6:
        formatMonth = "7";
        break;
      case 7:
        formatMonth = "8";
        break;
      case 8:
        formatMonth = "9";
        break;
      case 9:
        formatMonth = "10";
        break;
      case 10:
        formatMonth = "11";
        break;
      case 11:
        formatMonth = "12";
        break;
    }
    
    let todaysDate:any;
    let formatMont;
    let newDate;
    let stringDate = date.toString();
    
    if (stringDate.length === 1) {
      stringDate = `0${stringDate}`;
      newDate = Number(stringDate);
      todaysDate = `${year}-${formatMont}-${newDate}`;
    }

    if(formatMonth.length === 1) {
      formatMonth = `0${formatMonth}`;
      formatMont = Number(formatMonth);
      todaysDate = `${year}-${formatMont}-${newDate}`;
    } 

      todaysDate = `${year}-${formatMonth}-${stringDate}`;
    return todaysDate;
} 

export default getTodaysDate;