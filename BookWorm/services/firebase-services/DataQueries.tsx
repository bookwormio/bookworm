import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { DB } from "../../firebase.config";
import { type CreateTrackingModel, type LineDataPointModel } from "../../types";

/**
 * Adds a data entry for a users time reading and number of pages
 * Combines getAllFollowing(), fetchPostsByUserID(), and sortPostsByDate() functions.
 * @param {CreateTrackingModel} tracking - A tracking object storing the userID, minutesRead, and pagesRead.
 * @returns {Promise<boolean>} A boolean promise, true if successful, false if not.
 */
export async function addDataEntry(
  tracking: CreateTrackingModel,
): Promise<boolean> {
  try {
    if (tracking.userid !== null) {
      const q = query(
        collection(DB, "data_collection"),
        where("user_id", "==", tracking.userid),
      );
      const dataCol = await getDocs(q);
      if (dataCol.empty) {
        // The collection doesn't exist for the user, so create it
        const userDataCollectionRef = collection(DB, "data_collection");
        const userDataDocRef = doc(userDataCollectionRef);
        await setDoc(userDataDocRef, { user_id: tracking.userid });
        const newDocRef = await getDoc(userDataDocRef);
        // console.log(newDocRef);
        const subColPageRef = collection(newDocRef.ref, "pages_read");
        await addDoc(subColPageRef, {
          added_at: serverTimestamp(),
          pages: tracking.pagesRead,
        });
        const subColTimeRef = collection(newDocRef.ref, "time_read");
        await addDoc(subColTimeRef, {
          added_at: serverTimestamp(),
          minutes: tracking.minutesRead,
        });
      } else {
        // console.log(dataCol.docs[0].ref);
        const subColPageRef = collection(dataCol.docs[0].ref, "pages_read");
        await addDoc(subColPageRef, {
          added_at: serverTimestamp(),
          pages: tracking.pagesRead,
        });
        const subColTimeRef = collection(dataCol.docs[0].ref, "time_read");
        await addDoc(subColTimeRef, {
          added_at: serverTimestamp(),
          minutes: tracking.minutesRead,
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

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
    const q = query(
      collection(DB, "data_collection"),
      where("user_id", "==", userID),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Add each user data to the array
        const subcollectionRef = collection(docRef, "pages_read");
        const subcollectionSnapshot = await getDocs(subcollectionRef);
        // Iterate over each document in the subcollection
        subcollectionSnapshot.forEach((subDoc) => {
          // console.log("Subdocument:", subDoc.id, subDoc.data());
          dataPoints.push({
            x: subDoc.data().added_at.seconds,
            y: subDoc.data().pages,
          });
        });
      }
      // console.log(dataPoints);
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching pages data:", error);
    throw error;
  }
}

/**
 * Method to retrieve the time read data from database and put it into a graphable format
 * @param userID - uid of whoever is logged in
 * @returns {Promise<LineDataPointModel[]>} - x: timestamp, y: time read
 */
export async function fetchTimeReadData(
  userID: string,
): Promise<LineDataPointModel[]> {
  const dataPoints: LineDataPointModel[] = [];
  try {
    const q = query(
      collection(DB, "data_collection"),
      where("user_id", "==", userID),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Add each user data to the array
        const subcollectionRef = collection(docRef, "time_read");
        const subcollectionSnapshot = await getDocs(subcollectionRef);
        // Iterate over each document in the subcollection
        subcollectionSnapshot.forEach((subDoc) => {
          // Construct LineDataPoint objects and push them into the dataPoints array
          dataPoints.push({
            x: subDoc.data().added_at.seconds,
            y: subDoc.data().minutes,
          });
        });
      }
      // console.log(dataPoints);
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching time data:", error);
    throw error;
  }
}
