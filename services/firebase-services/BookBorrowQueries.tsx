import {
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { BORROW_BOOK_COLLECTION_REF } from "../../constants/constants";
import {
  ServerBookBorrowRole,
  ServerBookBorrowStatus,
  ServerBookShelfName,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";
import {
  type BookBorrowModel,
  type BookShelfBookModel,
  type BookStatusModel,
} from "../../types";
import {
  convertBorrowDocToModel,
  makeBorrowDocID,
  mapBookshelfDocToBookShelfBookModel,
  validateBorrowParams,
} from "../util/bookBorrowUtils";
import { getBookRequestStatusForBooks } from "./NotificationQueries";

/**
 * Lends a book to another user.
 *
 * @param {string} lenderUserID - The ID of the user lending the book.
 * @param {string} borrowerUserID - The ID of the user borrowing the book.
 * @param {string} bookID - The ID of the book being lent.
 * @returns {Promise<boolean>} A promise that resolves to true if the book was successfully lent.
 * @throws {Error} If there's an error during the lending process.
 */
export async function lendBookToUser(
  lenderUserID: string,
  borrowerUserID: string,
  bookID: string,
): Promise<boolean> {
  try {
    validateBorrowParams(lenderUserID, borrowerUserID, bookID);
    return await updateBorrowStatus(
      borrowerUserID,
      lenderUserID,
      bookID,
      ServerBookBorrowStatus.BORROWING,
    );
  } catch (error) {
    throw new Error(`Error lending book: ${(error as Error).message}`);
  }
}

/**
 * Returns a book to its owner.
 *
 * @param {string} borrowerUserID - The ID of the user returning the book.
 * @param {string} lenderUserID - The ID of the user who lent the book.
 * @param {string} bookID - The ID of the book being returned.
 * @returns {Promise<boolean>} A promise that resolves to true if the book was successfully returned.
 * @throws {Error} If there's an error during the returning process.
 */
export async function returnBookToUser(
  borrowerUserID: string,
  lenderUserID: string,
  bookID: string,
): Promise<boolean> {
  try {
    validateBorrowParams(borrowerUserID, lenderUserID, bookID);

    return await updateBorrowStatus(
      borrowerUserID,
      lenderUserID,
      bookID,
      ServerBookBorrowStatus.RETURNED,
    );
  } catch (error) {
    throw new Error(`Error returning book: ${(error as Error).message}`);
  }
}

/**
 * Helper function to update the borrow status of a book.
 *
 * @param {string} borrowerUserID - The ID of the user borrowing or returning the book.
 * @param {string} lenderUserID - The ID of the other user involved in the transaction.
 * @param {string} bookID - The ID of the book being borrowed or returned.
 * @param {ServerBookBorrowStatus} newBorrowStatus - The new borrow status to be set.
 * @returns {Promise<boolean>} A promise that resolves to true if the status was successfully updated.
 * @throws {Error} If there's an error updating the book status.
 */
async function updateBorrowStatus(
  borrowerUserID: string,
  lenderUserID: string,
  bookID: string,
  newBorrowStatus: ServerBookBorrowStatus,
): Promise<boolean> {
  const borrowBookDocRef = doc(
    DB,
    BORROW_BOOK_COLLECTION_REF,
    makeBorrowDocID(borrowerUserID, lenderUserID, bookID),
  );

  try {
    const docSnapshot = await getDoc(borrowBookDocRef);

    if (!docSnapshot.exists()) {
      await setDoc(borrowBookDocRef, {
        created_at: serverTimestamp(),
        borrow_status: newBorrowStatus,
        borrowing_user: borrowerUserID,
        lending_user: lenderUserID,
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
    throw new Error(`Error updating book status: ${(error as Error).message}`);
  }
}

/**
 * Retrieves all books that the specified user is currently borrowing.
 *
 * @param {string} userID - The ID of the user whose borrowing books are to be retrieved.
 * @returns {Promise<BookBorrowModel[]>} A promise that resolves to an array of BookBorrowModel objects.
 * @throws {Error} If there's an error retrieving the books.
 */
export async function getBorrowingBookModelsForUser(
  userID: string,
): Promise<BookBorrowModel[]> {
  return await getAllBooksForUser(userID, ServerBookBorrowRole.BORROWER);
}

/**
 * Retrieves all books that the specified user is currently lending.
 *
 * @param {string} userID - The ID of the user whose lending books are to be retrieved.
 * @returns {Promise<BookBorrowModel[]>} A promise that resolves to an array of BookBorrowModel objects.
 * @throws {Error} If there's an error retrieving the books.
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
 * @throws {Error} If there's an error retrieving the books.
 */
async function getAllBooksForUser(
  userID: string,
  userType: ServerBookBorrowRole,
): Promise<BookBorrowModel[]> {
  try {
    const bookRef = collection(DB, BORROW_BOOK_COLLECTION_REF);
    const q = query(
      bookRef,
      where(userType, "==", userID),
      where("borrow_status", "==", ServerBookBorrowStatus.BORROWING),
    );
    const bookSnapshot = await getDocs(q);
    return bookSnapshot.docs.map(convertBorrowDocToModel);
  } catch (error) {
    throw new Error(
      `Error getting ${userType} books: ${(error as Error).message}`,
    );
  }
}

/**
 * Retrieves the lending status of a specific book between two users.
 *
 * @param {string} borrowerUserID - The ID of the current user.
 * @param {string} lenderUserID - The ID of the other user involved in the lending.
 * @param {string} bookID - The ID of the book whose lending status is being checked.
 * @returns {Promise<BookBorrowModel>} A promise that resolves to a BookBorrowModel.
 * @throws {Error} If there's an error retrieving the book lending status.
 */
export async function getBookLendingStatus(
  borrowerUserID: string,
  lenderUserID: string,
  bookID: string,
): Promise<BookBorrowModel | null> {
  try {
    validateBorrowParams(borrowerUserID, lenderUserID, bookID);

    const borrowBookDocRef = doc(
      DB,
      BORROW_BOOK_COLLECTION_REF,
      makeBorrowDocID(borrowerUserID, lenderUserID, bookID),
    );

    const borrowBookDocSnap = await getDoc(borrowBookDocRef);
    if (borrowBookDocSnap.exists()) {
      return convertBorrowDocToModel(borrowBookDocSnap);
    } else {
      return {
        bookID,
        lendingUserID: lenderUserID,
        borrowingUserID: borrowerUserID,
        borrowStatus: ServerBookBorrowStatus.NONE,
      };
    }
  } catch (error) {
    throw new Error(
      `Error getting book lending status: ${(error as Error).message}`,
    );
  }
}

/**
 * Retrieves the lending statuses for a set of books lent by a specific user.
 *
 * This function queries the Firestore database for books that are currently
 * being borrowed, which were lent by the specified user and match the given book IDs.
 *
 * @param {string} userID - The ID of the user who is lending the books.
 * @param {string[]} bookIDs - An array of book IDs to check for lending statuses.
 * @returns {Promise<BookBorrowModel[]>} A promise that resolves to an array of BookBorrowModel objects,
 *                                       representing the lending statuses of the specified books.
 * @throws {Error} If there's an error querying the Firestore database.
 */
export async function getLendingStatusesForBooks(
  userID: string,
  bookIDs: string[],
): Promise<BookBorrowModel[]> {
  try {
    const bookRef = collection(DB, BORROW_BOOK_COLLECTION_REF);
    // TODO batch this
    const q = query(
      bookRef,
      and(
        where("lending_user", "==", userID),
        // Don't get books that are in NONE status
        or(
          where("borrow_status", "==", ServerBookBorrowStatus.BORROWING),
          where("borrow_status", "==", ServerBookBorrowStatus.RETURNED),
        ),
        where("book_id", "in", bookIDs),
      ),
    );
    const bookSnapshot = await getDocs(q);
    return bookSnapshot.docs.map(convertBorrowDocToModel);
  } catch (error) {
    throw new Error(
      `Error getting lending statuses for books: ${(error as Error).message}`,
    );
  }
}

/**
 * Fetches lending statuses and book request statuses for given book IDs in the lending library.
 *
 * @param {string} ownerID - The ID of the book owner.
 * @param {string} currentUserID - The ID of the current user (used for book request statuses).
 * @param {string[]} bookIDs - Array of book IDs to fetch statuses for.
 * @returns {Promise<Record<string, BookStatusModel>>} - A promise that resolves to an object containing combined status info for each book ID.
 */
export async function getLendingLibraryBookStatuses(
  ownerID: string,
  currentUserID: string,
  bookIDs: string[],
): Promise<Record<string, BookStatusModel>> {
  if (ownerID == null || ownerID === "") {
    throw new Error("Owner ID is invalid");
  }
  if (currentUserID == null || currentUserID === "") {
    throw new Error("Current user ID is invalid");
  }

  try {
    if (bookIDs.length === 0) {
      return {};
    }

    const [lendingStatuses, bookRequestStatuses] = await Promise.all([
      getLendingStatusesForBooks(ownerID, bookIDs),
      getBookRequestStatusForBooks(currentUserID, ownerID, bookIDs),
    ]);

    const bookStatuses: Record<string, BookStatusModel> = {};

    bookIDs.forEach((bookID) => {
      bookStatuses[bookID] = {
        borrowInfo: lendingStatuses.find((status) => status.bookID === bookID),
        requestStatus: bookRequestStatuses[bookID],
      };
    });

    return bookStatuses;
  } catch (error) {
    throw new Error(
      `Error getting lending library book statuses: ${(error as Error).message}`,
    );
  }
}

/**
 * Fetches full book details for all books a user is borrowing.
 * Makes individual queries to each lending user's bookshelf due to Firestore collection limitations.
 *
 * @param userID - ID of the borrowing user
 * @param borrowedBooks - Array of books the user is currently borrowing
 * @returns Array of full book details from lenders' bookshelves, excluding any deleted books
 * @throws Error if fetching fails
 */
export async function getBorrowedBookShelfBooksForUser(
  userID: string,
  borrowedBooks: BookBorrowModel[],
): Promise<BookShelfBookModel[]> {
  try {
    const lendingShelf = ServerBookShelfName.LENDING_LIBRARY;

    // Create a promise for each borrowed book to fetch the bookshelf doc
    const bookPromises = borrowedBooks.map(
      async (borrowedBook): Promise<BookShelfBookModel | null> => {
        const bookshelfRef = doc(
          DB,
          "bookshelf_collection",
          borrowedBook.lendingUserID,
          lendingShelf,
          borrowedBook.bookID,
        );

        const bookDoc = await getDoc(bookshelfRef);

        if (!bookDoc.exists()) {
          return null;
        }
        return mapBookshelfDocToBookShelfBookModel(bookDoc);
      },
    );

    // Yes, this is an n+1.
    // Firebase does not have a getAllDocs, and because these books are in separate collections
    // we need to fetch them one by one. 😞

    // Filter out any null values (books that were not found in the bookshelf)
    const bookShelfBooks = (await Promise.all(bookPromises)).filter(
      (book): book is BookShelfBookModel => book !== null,
    );

    return bookShelfBooks;
  } catch (error) {
    console.error("Error fetching borrowed books: ", error);
    throw new Error(
      `Failed to fetch borrowed books for user ${userID}: ${(error as Error).message}`,
    );
  }
}
