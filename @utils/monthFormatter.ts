let month = new Date().getMonth();

function getMonth() {
  let formatMonth: string = "0";

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
  if (formatMonth.length === 1) {
    formatMonth = `0${formatMonth}`;
    let formatMont = Number(formatMonth);
  }

  return formatMonth;
}

export default getMonth;
