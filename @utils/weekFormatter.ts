import getMonth from "./monthFormatter";

let month = getMonth();
let day = new Date().getDay();
let date = new Date().getDate();
let year = new Date().getFullYear();
let firstDayOfTheWeek:any;
let startWeek:any;


function getFirstDayOfTheWeek() {
    switch (day) {
      case 0:
        firstDayOfTheWeek = date;
        break;
      case 1:
        firstDayOfTheWeek = date - day;
        break;
      case 2:
        firstDayOfTheWeek = date - day;
        break;
      case 3:
        firstDayOfTheWeek = date - day;
        break;
      case 4:
        firstDayOfTheWeek = date - day;
        break;
      case 5:
        firstDayOfTheWeek = date - day;
        break;
      case 6:
        firstDayOfTheWeek = date - day;
        break;
    }

    firstDayOfTheWeek = firstDayOfTheWeek.toString();
    let formatDayOfWeek;
    let firstDayOfTheWeekArray = firstDayOfTheWeek.split("");
    console.log(firstDayOfTheWeekArray)
    firstDayOfTheWeek = firstDayOfTheWeekArray[1];

    // if()

    if(firstDayOfTheWeek.length === 1) {
        firstDayOfTheWeek = `0${firstDayOfTheWeek}`;
        formatDayOfWeek = Number(firstDayOfTheWeek);
        startWeek = `${year}-${month}-${formatDayOfWeek}`;
    }
    console.log(date,  " " , day)

    startWeek = `${year}-${month}-${firstDayOfTheWeek}`;
    return startWeek;
}

export default getFirstDayOfTheWeek;
