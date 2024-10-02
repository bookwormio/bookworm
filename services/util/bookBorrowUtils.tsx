import {
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { type BookBorrowModel } from "../../types";

/**
 * Converts a Firestore document snapshot to a BookBorrowModel.
 *
 * @param {QueryDocumentSnapshot<DocumentData, DocumentData>} doc - The Firestore document snapshot.
 * @returns {BookBorrowModel} The converted BookBorrowModel object.
 */
export function convertBorrowDocToModel(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): BookBorrowModel {
  const data = doc.data();
  return {
    bookID: data.book_id,
    lendingUserID: data.lending_user,
    borrowingUserID: data.borrowing_user,
    borrowStatus: data.borrow_status,
  };
}

/**
 * Generates a document ID for a book borrowing record.
 *
 * @param {string} currentUserID - The ID of the user borrowing the book.
 * @param {string} friendUserID - The ID of the user lending the book.
 * @param {string} bookID - The ID of the book being borrowed.
 * @returns {string} A unique document ID string.
 */
export function makeBorrowDocID(
  currentUserID: string,
  friendUserID: string,
  bookID: string,
): string {
  return `${currentUserID}_${friendUserID}_${bookID}`;
}

/**
 * Validates the parameters for book borrowing operations.
 * Throws an error if any of the parameters are invalid.
 *
 * @param {string} currentUserID - The ID of the user initiating the borrowing action.
 * @param {string} friendUserID - The ID of the user involved in the borrowing action.
 * @param {string} bookID - The ID of the book involved in the borrowing action.
 * @throws {Error} If any of the parameters are null or an empty string.
 */
export function validateBorrowParams(
  currentUserID: string,
  friendUserID: string,
  bookID: string,
): void {
  if (currentUserID == null || currentUserID === "") {
    throw new Error("Current user ID is invalid");
  }
  if (friendUserID == null || friendUserID === "") {
    throw new Error("Friend user ID is invalid");
  }
  if (bookID == null || bookID === "") {
    throw new Error("Book ID is invalid");
  }
}
