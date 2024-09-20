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

    const currentRef = collection(
      DB,
      `bookmark_collection/${userID}/bookmarks`,
    );
    const currentQuery = query(currentRef);
    const currentSnap = await getDocs(currentQuery);

    if (!currentSnap.empty) {
      for (const currentDoc of currentSnap.docs) {
        const mostRecentHistory = historySnap.docs.find(
          (historyDoc) => historyDoc.data().bookID === currentDoc.id,
        );
        dataPoints.push({
          x: currentDoc.data().updated.seconds,
          y:
            currentDoc.data().bookmark - (mostRecentHistory?.data().pages ?? 0),
        });
      }
      for (const historyDoc of historySnap.docs) {
        dataPoints.push({
          x: historyDoc.data().added_at.seconds,
          y: historyDoc.data().pages,
        });
      }
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching time data:", error);
    throw error;
  }
}
