import {
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  type BookBorrowModel,
  type BookShelfBookModel,
  type BorrowingBookshelfModel,
} from "../../types";

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
 * @param {string} borrowerUserID - The ID of the user borrowing the book.
 * @param {string} lenderUserID - The ID of the user lending the book.
 * @param {string} bookID - The ID of the book being borrowed.
 * @returns {string} A unique document ID string.
 */
export function makeBorrowDocID(
  borrowerUserID: string,
  lenderUserID: string,
  bookID: string,
): string {
  return `${borrowerUserID}_${lenderUserID}_${bookID}`;
}

/**
 * Validates the parameters for book borrowing operations.
 * Throws an error if any of the parameters are invalid.
 *
 * @param {string} borrowerUserID - The ID of the user initiating the borrowing action.
 * @param {string} lenderUserID - The ID of the user involved in the borrowing action.
 * @param {string} bookID - The ID of the book involved in the borrowing action.
 * @throws {Error} If any of the parameters are null or an empty string.
 */
export function validateBorrowParams(
  borrowerUserID: string,
  lenderUserID: string,
  bookID: string,
): void {
  if (borrowerUserID == null || borrowerUserID === "") {
    throw new Error("Borrower user ID is invalid");
  }
  if (lenderUserID == null || lenderUserID === "") {
    throw new Error("Lender user ID is invalid");
  }
  if (bookID == null || bookID === "") {
    throw new Error("Book ID is invalid");
  }
}

/**
 * Converts a Firestore document snapshot to a BookShelfBookModel.
 *
 * @param {QueryDocumentSnapshot<DocumentData, DocumentData>} bookDoc - The Firestore document snapshot.
 * @returns {BookShelfBookModel} The converted BookShelfBookModel object.
 */
export function mapBookshelfDocToBookShelfBookModel(
  bookDoc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): BookShelfBookModel {
  const bookData = bookDoc.data();
  return {
    id: bookDoc.id,
    created: bookData.created,
    volumeInfo: {
      title: bookData?.title,
      subtitle: bookData?.subtitle,
      authors: bookData?.authors,
      publisher: bookData?.publisher,
      publishedDate: bookData?.publishedDate,
      description: bookData?.description,
      pageCount: bookData?.pageCount,
      categories: bookData?.categories,
      maturityRating: bookData?.maturityRating,
      previewLink: bookData?.previewLink,
      averageRating: bookData?.averageRating,
      ratingsCount: bookData?.ratingsCount,
      language: bookData?.language,
      mainCategory: bookData?.mainCategory,
      thumbnail: bookData?.thumbnail,
    },
  };
}

/**
 * Combines book shelf models with their corresponding borrow information
 *
 * @param {BookBorrowModel[]} borrowModels - The borrow information for the books.
 * @param {BookShelfBookModel[]} bookShelfModels - The book shelf information for the books.
 * @returns {BorrowingBookshelfModel[]} An array of combined borrow and shelf information.
 */
export const combineBorrowingAndShelfData = (
  borrowModels: BookBorrowModel[],
  bookShelfModels: BookShelfBookModel[],
): BorrowingBookshelfModel[] => {
  const borrowModelMap = new Map(
    borrowModels.map((model) => [model.bookID, model]),
  );

  const fullModels: BorrowingBookshelfModel[] = bookShelfModels
    .map((bookModel) => {
      const borrowInfo = borrowModelMap.get(bookModel.id);
      if (borrowInfo == null) return null;

      return {
        borrowInfo,
        bookShelfInfo: bookModel,
      };
    })
    .filter((model): model is BorrowingBookshelfModel => model !== null);

  return fullModels;
};
