import {
  collection,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
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
    const bookmarksRef = collection(
      DB,
      `bookmark_collection/${userID}/bookmarks`,
    );
    const q = query(bookmarksRef);
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const docSnap = await getDoc(doc.ref);
        if (docSnap.exists()) {
          const currentPage = docSnap.data().bookmark;
          const currentDate = docSnap.data().updated;
          const subColHistoryRef = collection(docSnap.ref, "history");
          const subColHistoryQuery = query(
            subColHistoryRef,
            orderBy("added_at", "desc"),
          );
          const subColHistorySnap = await getDocs(subColHistoryQuery);
          if (!subColHistorySnap.empty) {
            subColHistorySnap.docs.forEach((subDoc, index) => {
              if (index === 0) {
                dataPoints.push({
                  x: currentDate.seconds,
                  y: currentPage - subDoc.data().pages,
                });
              }
              dataPoints.push({
                x: subDoc.data().added_at.seconds,
                y: subDoc.data().pages,
              });
            });
          } else {
            dataPoints.push({
              x: currentDate.seconds,
              y: currentPage,
            });
          }
        }
      }
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching time data:", error);
    throw error;
  }
}
