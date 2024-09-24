import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";

// CLOUD FUNCTIONS GO HERE
// To deploy a cloud function, run the following command from console:
// firebase deploy --only functions
// This will only deploy the functions that have been modified / deleted

// https://firebase.google.com/docs/functions/typescript

// initialize an admin view of the app to use these functions
admin.initializeApp();

export const createUserDoc = functions.auth.user().onCreate(async (user) => {
  const userId = user.uid;

  try {
    const writeResult = await admin
      .firestore()
      .collection("user_collection")
      .doc(userId)
      .set({
        email: user.email,
        isPublic: false,
        // Add any other user properties you want to store
      });

    logger.log("User Created result:", writeResult);
  } catch (err) {
    logger.log(err);
  }
});

export const deleteUserDoc = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;

  try {
    await admin.firestore().collection("user_collection").doc(userId).delete();
    logger.log("User document deleted for user:", userId);
  } catch (err) {
    logger.log(err);
  }
});
