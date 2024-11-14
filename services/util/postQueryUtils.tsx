import {
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { ref, type StorageReference } from "firebase/storage";
import { STORAGE } from "../../firebase.config";
import { type CommentModel, type PostModel, type UserModel } from "../../types";

/**
 * Generates an array of Firebase Storage references for a post's images
 */
export function createPostImageRefs(
  postDoc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): StorageReference[] {
  const imageStorageRefs: StorageReference[] = [];
  const imageCount = postDoc.data().image;
  for (let index = 0; index < imageCount; index++) {
    imageStorageRefs[index] = ref(STORAGE, `posts/${postDoc.id}/${index}`);
  }
  return imageStorageRefs;
}

/**
 * Creates a PostModel from a Firestore document and user data
 */
export function makePostModelFromDoc(
  postDoc: QueryDocumentSnapshot<DocumentData, DocumentData>,
  user: UserModel,
): PostModel {
  const data = postDoc.data();
  return {
    id: postDoc.id,
    bookid: data.bookid,
    booktitle: data.booktitle,
    created: data.created,
    text: data.text,
    user,
    imageStorageRefs: createPostImageRefs(postDoc),
    likes: data.likes ?? [],
    comments: (data.comments as CommentModel[]) ?? [],
    oldBookmark: data.oldBookmark,
    newBookmark: data.newBookmark,
    totalPages: data.totalPages,
  };
}
