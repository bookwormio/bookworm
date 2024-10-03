import {
    type BookShelfBookModel,
    type LineDataPointModel,
} from "../../../types";

/**
 *
 *
 * @param {Date} createdDate - The date when the notification was created.
 * @returns {string} numPages
 *
 */
export function calculatePagesWithinWeek(pagesData: LineDataPointModel[]) {
  let numPages = 0;
  const sunday = new Date();
  // takes current data and subtracts what day it is so we get to 0 which is sunday
  sunday.setDate(sunday.getDate() - sunday.getDay());
  sunday.setHours(0, 0, 0, 0);

  // adding 6 so we can get the saturday date
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const sundayMili = sunday.getTime();
  const saturdayMili = saturday.getTime();

  pagesData.forEach((item) => {
    const dateMili = new Date(item.x * 1000).getTime();
    if (dateMili >= sundayMili && dateMili <= saturdayMili) {
      numPages += item.y;
    }
  });
  return numPages;
}

export function calculateBooksWithinMonth(
  finishBookShelf: BookShelfBookModel[],
) {
  let numBooks = 0;
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  console.log(firstDay.toDateString(), lastDay.toDateString());

  const firstDayMili = firstDay.getTime();
  const lastDayMili = lastDay.getTime();

  finishBookShelf.forEach((item) => {
    const dateMili = new Date(item.created.seconds * 1000).getTime();

    if (dateMili >= firstDayMili && dateMili <= lastDayMili) {
      numBooks += 1;
    }
  });

  return numBooks;
}
