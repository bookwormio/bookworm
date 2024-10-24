import {
  type BookShelfBookModel,
  type LineDataPointModel,
} from "../../../types";

/**
 * Calculates the number of pages a user has read this week (Sunday-Saturday)
 *
 * @param {LineDataPointModel[]} pagesData - x: time in seconds the reading update was posted, y: number of pages
 * @returns {number} numPages - number of pages the user read in a week
 */
export function calculatePagesWithinWeek(pagesData: LineDataPointModel[]) {
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

  return getPagesWithinTimeFrame(pagesData, sundayMili, saturdayMili);
}

/**
 * Gets number of pages within a certain timeframe
 *
 * @param pagesData
 * @param {number} startMilli - beginning of time frame
 * @param {number} endMilli - end of time frame
 * @return {number} number of pages
 */
export function getPagesWithinTimeFrame(
  pagesData: LineDataPointModel[],
  startMilli: number,
  endMilli: number,
) {
  let numPages = 0;
  pagesData.forEach((item) => {
    const dateMili = toMilli(item.x);
    if (dateMili >= startMilli && dateMili <= endMilli) {
      numPages += item.y;
    }
  });
  return numPages;
}

/**
 * Gets the first and last dates of the month in time
 *
 * @returns {[number, number]} - first and last dates of the month in time
 */
export function getFirstLastMonthDates() {
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  return [firstDay.getTime(), lastDay.getTime()];
}

/**
 * Gets the first and last dates of the year in time
 *
 * @returns {[number, number]} - first and last dates of the year in time
 */
export function getFirstLastYearDates() {
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), 0, 1);
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(today.getFullYear(), 11, 31);
  lastDay.setHours(23, 59, 59, 999);

  return [firstDay.getTime(), lastDay.getTime()];
}

/**
 * Calculates the number of books a user has read in the current month
 *
 * @returns {number} - number of books
 */
export function calculateBooksWithinMonth(
  finishBookShelf: BookShelfBookModel[],
) {
  const firstLastMili = getFirstLastMonthDates();
  return calculateBooksWithinTimeFrame(
    finishBookShelf,
    firstLastMili[0],
    firstLastMili[1],
  );
}

/**
 * Calculates the number of books a user has read in the given time frame
 * @param {BookShelfBookModel[]} finishBookShelf - list of books with id, created, and volume info of the finished bookshelf
 * @param {number} startMilli - beginning of time frame
 * @param {number} endMilli - end of time frame
 * @returns {number} - number of books
 */
export function calculateBooksWithinTimeFrame(
  finishBookShelf: BookShelfBookModel[],
  startMilli: number,
  endMilli: number,
) {
  const filteredBooks = finishBookShelf.filter((book) => {
    const dateMili = toMilli(book.created.seconds);
    return dateMili >= startMilli && dateMili <= endMilli;
  });

  return filteredBooks.length;
}

/**
 * Finds the top genre based on the finished bookshelf and the currently reading bookshelf for the year
 *
 * @param {BookShelfBookModel[]} finishBookShelf - list of books with id, created, and volume info of the finished bookshelf
 * @param {BookShelfBookModel[]} currentBookShelf - list of books with id, created, and volume info of the currently reading bookshelf
 * @returns {string} - top genre
 */
export function findYearTopGenre(
  finishBookShelf: BookShelfBookModel[],
  currentBookShelf: BookShelfBookModel[],
) {
  const firstLastMili = getFirstLastYearDates();
  return findTopGenre(
    finishBookShelf,
    currentBookShelf,
    firstLastMili[0],
    firstLastMili[1],
  );
}

/**
 * Finds the top genre based on the finished bookshelf and the currently reading bookshelf within the timeframe
 * Counts the amount of time the category appears in the two bookshelves, then returns the genre with max count
 * If there is a tie, we find the main genre splitting up categories by / and return the max of those maine genres.
 *
 * @param {BookShelfBookModel[]} finishBookShelf - list of books with id, created, and volume info of the finished bookshelf
 * @param {BookShelfBookModel[]} currentBookShelf - list of books with id, created, and volume info of the currently reading bookshelf
 * @param {number} startMilli - beginning of time frame
 * @param {number} endMilli - end of time frame
 * @returns {string} - top genre
 */
export function findTopGenre(
  finishBookShelf: BookShelfBookModel[],
  currentBookShelf: BookShelfBookModel[],
  startMilli: number,
  endMilli: number,
) {
  const relevantBookShelves = finishBookShelf.concat(currentBookShelf);
  const genreDict = new Map();

  relevantBookShelves.forEach((book) => {
    const dateMili = toMilli(book.created.seconds);
    if (dateMili >= startMilli && dateMili <= endMilli) {
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

/**
 * @param {number} seconds - seconds given to convert
 * @return {number} - milliseconds
 */
export function toMilli(seconds: number) {
  return new Date(seconds * 1000).getTime();
}
