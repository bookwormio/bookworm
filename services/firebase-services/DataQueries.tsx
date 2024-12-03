import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { DB } from "../../firebase.config";
import { type LineDataPointModel } from "../../types";

/**
 * Method to retrieve the time read data from database and put it into a graphable format
 * @param userID - uid of whoever is logged in
 * @returns {Promise<LineDataPointModel[]>} - x: timestamp, y: pages read
 */
export async function fetchPagesReadData(
  userID: string,
): Promise<LineDataPointModel[]> {
  const dataPoints: LineDataPointModel[] = [];
  try {
    const historyRef = collection(
      DB,
      `user_collection/${userID}/reading_history`,
    );
    const historyQuery = query(historyRef, orderBy("added_at", "desc"));
    const historySnap = await getDocs(historyQuery);

    for (const historyDoc of historySnap.docs) {
      const historyData = historyDoc.data();
      dataPoints.push({
        x: historyData.added_at.seconds,
        y: historyData.pages,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error("Error fetching reading data:", error);
    throw error;
  }
}

/**
 * Method to retrieve the dates books were added to the 'finished' shelf.
 * Keeps a running tally of the number of books added to 'finished' per month.
 * @param userID - uid of whoever is logged in
 * @returns {Promise<LineDataPointModel[]>} - x: timestamp, y: books finished
 */
export async function fetchBooksFinishedData(
  userID: string,
): Promise<LineDataPointModel[]> {
  const dataPoints: LineDataPointModel[] = [];
  try {
    const finishedRef = collection(
      DB,
      `bookshelf_collection/${userID}/finished`,
    );
    const finishedQuery = query(finishedRef);
    const finishedSnap = await getDocs(finishedQuery);

    for (const finishedDoc of finishedSnap.docs) {
      dataPoints.push({
        x: finishedDoc.data().created.seconds,
        y: 1,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error("Error fetching bookshelf data:", error);
    throw error;
  }
}
