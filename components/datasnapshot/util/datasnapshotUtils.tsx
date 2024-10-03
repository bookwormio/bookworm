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

export function getFirstLastMonthDates() {
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  return [firstDay.getTime(), lastDay.getTime()];
}

export function getFirstLastYearDates() {
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), 0, 1);

  const lastDay = new Date(today.getFullYear(), 11, 31);
  lastDay.setHours(23, 59, 59, 999);

  return [firstDay.getTime(), lastDay.getTime()];
}

export function calculateBooksWithinMonth(
  finishBookShelf: BookShelfBookModel[],
) {
  let numBooks = 0;

  const firstLastMili = getFirstLastMonthDates();

  finishBookShelf.forEach((book) => {
    const dateMili = new Date(book.created.seconds * 1000).getTime();

    if (dateMili >= firstLastMili[0] && dateMili <= firstLastMili[1]) {
      numBooks += 1;
    }
  });

  return numBooks;
}

export function findTopGenre(
  finishBookShelf: BookShelfBookModel[],
  currentBookShelf: BookShelfBookModel[],
) {
  const relevantBookShelves = finishBookShelf.concat(currentBookShelf);
  const firstLastMili = getFirstLastYearDates();
  const genreDict = new Map();

  relevantBookShelves.forEach((book) => {
    const dateMili = new Date(book.created.seconds * 1000).getTime();
    if (dateMili >= firstLastMili[0] && dateMili <= firstLastMili[1]) {
      book.volumeInfo.categories?.forEach((cat) => {
        if (genreDict.has(cat)) {
          genreDict.set(cat, genreDict.get(cat) + 1);
        } else {
          genreDict.set(cat, 1);
        }
      });
    }
  });

  let maxVal = null;
  let maxKey = [];
  for (const [key, value] of genreDict) {
    if (maxVal == null) {
      maxVal = value;
      maxKey.push(key);
    } else if (maxVal === value) {
      maxKey.push(key);
    } else if (maxVal < value) {
      maxKey = [key];
    }
  }

  if (maxKey.length === 1) {
    return maxKey[0];
  } else if (maxKey.length === 0) {
    return "";
  } else {
    const mainGenreDict = new Map();
    maxKey.forEach((key) => {
      const mainGenre = key.split(" / ")[0];
      if (mainGenreDict.has(mainGenre)) {
        mainGenreDict.set(mainGenre, mainGenreDict.get(mainGenre) + 1);
      } else {
        mainGenreDict.set(mainGenre, 1);
      }
    });
    let maxMainVal = null;
    let maxMainKey = null;
    for (const [key, value] of mainGenreDict) {
      if (maxVal == null) {
        maxMainVal = value;
        maxMainKey = key;
      } else if (value > maxMainVal) {
        maxMainVal = value;
        maxMainKey = key;
      }
    }
    return maxMainKey;
  }
}
