import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { BORROW_BOOK_COLLECTION_REF } from "../../constants/constants";
import {
  ServerBookBorrowRole,
  ServerBookBorrowStatus,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";
import { type BookBorrowModel } from "../../types";
import {
  convertBorrowDocToModel,
  makeBorrowDocID,
  validateBorrowParams,
} from "../util/bookBorrowUtils";

/**
 * Borrows a book from another user.
 *
 * @param {string} currentUserID - The ID of the user borrowing the book.
 * @param {string} friendUserID - The ID of the user lending the book.
 * @param {string} bookID - The ID of the book being borrowed.
 * @returns {Promise<boolean>} A promise that resolves to true if the book was successfully borrowed, false otherwise.
 */
export async function borrowBookFromUser(
  currentUserID: string,
  friendUserID: string,
  bookID: string,
): Promise<boolean> {
  try {
    validateBorrowParams(currentUserID, friendUserID, bookID);
    return await updateBorrowStatus(
      currentUserID,
      friendUserID,
      bookID,
      ServerBookBorrowStatus.BORROWING,
    );
  } catch (error) {
    console.error("Error borrowing book:", error);
    return false;
  }
}

/**
 * Returns a book to its owner.
 *
 * @param {string} currentUserID - The ID of the user returning the book.
 * @param {string} friendUserID - The ID of the user who lent the book.
 * @param {string} bookID - The ID of the book being returned.
 * @returns {Promise<boolean>} A promise that resolves to true if the book was successfully returned, false otherwise.
 */
export async function returnBookToUser(
  currentUserID: string,
  friendUserID: string,
  bookID: string,
): Promise<boolean> {
  try {
    validateBorrowParams(currentUserID, friendUserID, bookID);

    return await updateBorrowStatus(
      currentUserID,
      friendUserID,
      bookID,
      ServerBookBorrowStatus.RETURNED,
    );
  } catch (error) {
    console.error("Error returning book:", error);
    return false;
  }
}

/**
 * Updates the borrow status of a book.
 *
 * @param {string} currentUserID - The ID of the user borrowing or returning the book.
 * @param {string} friendUserID - The ID of the other user involved in the transaction.
 * @param {string} bookID - The ID of the book being borrowed or returned.
 * @param {ServerBookBorrowStatus} newBorrowStatus - The new borrow status to be set.
 * @returns {Promise<boolean>} A promise that resolves to true if the status was successfully updated.
 * @throws {Error} If there's an error updating the book status.
 */
async function updateBorrowStatus(
  currentUserID: string,
  friendUserID: string,
  bookID: string,
  newBorrowStatus: ServerBookBorrowStatus,
): Promise<boolean> {
  const borrowBookDocRef = doc(
    DB,
    BORROW_BOOK_COLLECTION_REF,
    makeBorrowDocID(currentUserID, friendUserID, bookID),
  );

  try {
    const docSnapshot = await getDoc(borrowBookDocRef);

    if (!docSnapshot.exists()) {
      await setDoc(borrowBookDocRef, {
        created_at: serverTimestamp(),
        borrow_status: newBorrowStatus,
        borrowing_user: currentUserID,
        lending_user: friendUserID,
        book_id: bookID,
      });
    } else {
      await setDoc(
        borrowBookDocRef,
        {
          borrow_status: newBorrowStatus,
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );
    }
    return true;
  } catch (error) {
    throw new Error("Error updating book status", error as Error);
  }
}

/**
 * Retrieves all books that the specified user is currently borrowing.
 *
 * @param {string} userID - The ID of the user whose borrowing books are to be retrieved.
 * @returns {Promise<BookBorrowModel[]>} A promise that resolves to an array of BookBorrowModel objects.
 */
export async function getAllBorrowingBooksForUser(
  userID: string,
): Promise<BookBorrowModel[]> {
  return await getAllBooksForUser(userID, ServerBookBorrowRole.BORROWER);
}

/**
 * Retrieves all books that the specified user is currently lending.
 *
 * @param {string} userID - The ID of the user whose lending books are to be retrieved.
 * @returns {Promise<BookBorrowModel[]>} A promise that resolves to an array of BookBorrowModel objects.
 */
export async function getAllLendingBooksForUser(
  userID: string,
): Promise<BookBorrowModel[]> {
  return await getAllBooksForUser(userID, ServerBookBorrowRole.LENDER);
}

/**
 * Retrieves all books that the specified user is currently borrowing or lending.
 *
 * @param {string} userID - The ID of the user whose books are to be retrieved.
 * @param {ServerBookBorrowRole} userType - The type of user (lender or borrower).
 * @returns {Promise<BookBorrowModel[]>} A promise that resolves to an array of BookBorrowModel objects.
 */
async function getAllBooksForUser(
  userID: string,
  userType: ServerBookBorrowRole,
): Promise<BookBorrowModel[]> {
  try {
    const bookRef = collection(DB, BORROW_BOOK_COLLECTION_REF);
    const q = query(bookRef, where(userType, "==", userID));
    const bookSnapshot = await getDocs(q);
    return bookSnapshot.docs.map(convertBorrowDocToModel);
  } catch (error) {
    console.error(`Error getting ${userType} books:`, error);
    return [];
  }
}

/**
 * Retrieves the lending status of a specific book between two users.
 *
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} friendUserID - The ID of the other user involved in the lending.
 * @param {string} bookID - The ID of the book whose lending status is being checked.
 * @returns {Promise<BookBorrowModel | null>} A promise that resolves to a BookBorrowModel if the book is found, or null if not found or in case of an error.
 */
export async function getBookLendingStatus(
  currentUserID: string,
  friendUserID: string,
  bookID: string,
): Promise<BookBorrowModel | null> {
  try {
    validateBorrowParams(currentUserID, friendUserID, bookID);

    const borrowBookDocRef = doc(
      DB,
      BORROW_BOOK_COLLECTION_REF,
      makeBorrowDocID(currentUserID, friendUserID, bookID),
    );

    const borrowBookDocSnap = await getDoc(borrowBookDocRef);
    if (borrowBookDocSnap.exists()) {
      return convertBorrowDocToModel(borrowBookDocSnap);
    } else {
      return {
        bookID,
        lendingUserID: friendUserID,
        borrowingUserID: currentUserID,
        borrowStatus: ServerBookBorrowStatus.NONE,
      };
    }
  } catch (error) {
    console.error("Error getting book lending status:", error);
    return null;
  }
}
