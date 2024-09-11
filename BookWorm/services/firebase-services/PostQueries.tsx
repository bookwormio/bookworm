import { Image } from "expo-image";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React from "react";
import {
  BLURHASH,
  POST_IMAGE_BORDER_RADIUS,
  POST_IMAGE_HEIGHT,
  POST_IMAGE_WIDTH,
} from "../../constants/constants";
import { DB, STORAGE } from "../../firebase.config";
import {
  type CommentModel,
  type CreatePostModel,
  type PostModel,
  type UserModel,
} from "../../types";
import { getAllFollowing } from "./FriendQueries";
import { fetchUser, fetchUsersByIDs } from "./UserQueries";

/**
 * Follows a user by updating the relationship document between the current user and the friend user.
 * If the document doesn't exist, it creates a new one; otherwise, it updates the existing document.
 * @param {User | null} user - The current user.
 * @param {string} book - The title of the book.
 * @param {string} text - Any text the user wants to add to the post
 * @param {string[]} imageURIs - A list of all image URIs of each image the user wants to upload (can be empty)
 * @returns {Promise<void>} A void promise if successful or an error if the document creation fails
 * @throws {Error} If there's an error during the operation.
 */
export async function createPost(post: CreatePostModel) {
  if (post.userid != null) {
    addDoc(collection(DB, "posts"), {
      user: post.userid,
      created: serverTimestamp(),
      bookid: post.bookid,
      booktitle: post.booktitle,
      text: post.text,
      image: post.images.length,
      oldBookmark: post.oldBookmark,
      newBookmark: post.newBookmark,
      totalPages: post.totalPages,
    })
      .then(async (docRef) => {
        if (post.images.length > 0) {
          await Promise.all(
            post.images.map(async (imageURI: string, index: number) => {
              const response = await fetch(imageURI);
              const blob = await response.blob();
              const storageRef = ref(
                STORAGE,
                "posts/" + docRef.id + "/" + index,
              );
              await uploadBytesResumable(storageRef, blob);
            }),
          );
        }
      })
      .catch((error) => {
        console.error("Error creating post", error);
      });
  }
}

/**
 * Fetches posts for the specified user IDs with pagination support.
 * If a last visible document snapshot is provided, it fetches the next page of posts.
 * @param {string[]} userIDs - The user IDs for which to fetch posts.
 * @param {QueryDocumentSnapshot<DocumentData, DocumentData> | null} [lastVisible=null] - The last visible document snapshot.
 * @returns {Promise<{
 *   posts: PostModel[]; // The array of fetched posts.
 *   newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null; // The new last visible document snapshot.
 * }>} A promise that resolves to an object containing the fetched posts and the new last visible document snapshot.
 */
export async function fetchPostsByUserIDs(
  userIDs: string[],
  lastVisible?: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
): Promise<{
  posts: PostModel[];
  newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}> {
  try {
    let postsQuery = query(
      collection(DB, "posts"),
      where("user", "in", userIDs),
      orderBy("created", "desc"),
      limit(10),
    );
    // if there is a last visible document, fetch the next visible
    if (lastVisible != null) {
      postsQuery = query(
        collection(DB, "posts"),
        where("user", "in", userIDs),
        orderBy("created", "desc"),
        startAfter(lastVisible),
        limit(10),
      );
    }
    const postsSnapshot = await getDocs(postsQuery);
    const postsData: PostModel[] = [];
    const userModels = await fetchUsersByIDs(userIDs);
    for (const postDoc of postsSnapshot.docs) {
      const userID: string = postDoc.data().user;
      try {
        const user = userModels.find((user) => user.id === userID);
        if (user != null) {
          const downloadPromises: Array<Promise<void>> = [];
          const images: JSX.Element[] = [];
          for (let index = 0; index < postDoc.data().image; index++) {
            const storageRef = ref(STORAGE, `posts/${postDoc.id}/${index}`);
            const promise = getDownloadURL(storageRef)
              .then((url) => {
                images[index] = (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    cachePolicy={"memory-disk"}
                    placeholder={BLURHASH}
                    style={{
                      height: POST_IMAGE_HEIGHT,
                      width: POST_IMAGE_WIDTH,
                      borderRadius: POST_IMAGE_BORDER_RADIUS,
                      marginRight: 10,
                    }}
                    contentFit="fill"
                  />
                );
              })
              .catch((error) => {
                console.error("Error fetching image ", error);
              });
            downloadPromises.push(promise);
          }
          await Promise.all(downloadPromises);
          const post = {
            id: postDoc.id,
            bookid: postDoc.data().bookid,
            booktitle: postDoc.data().booktitle,
            created: postDoc.data().created,
            text: postDoc.data().text,
            user,
            images,
            oldBookmark: postDoc.data().oldBookmark,
            newBookmark: postDoc.data().newBookmark,
            likes: postDoc.data().likes ?? [],
            comments: (postDoc.data().comments as CommentModel[]) ?? [],
            totalPages: postDoc.data().totalPages,
          };
          postsData.push(post);
        }
      } catch (error) {
        console.error("Error fetching user", error);
      }
    }
    const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
    return { posts: postsData, newLastVisible: lastVisibleDoc };
  } catch (error) {
    console.error("Error fetching posts by User ID", error);
    return { posts: [], newLastVisible: null };
  }
}

/**
 * Retrieves a post by it's postID.
 * @param {string} postID - The ID of the post to be retrieved.
 * @returns {Promise<PostModel | null>} A promise that resolves to the PostModel if found.
 */
export async function fetchPostByPostID(
  postID: string,
): Promise<PostModel | null> {
  try {
    let post: PostModel | null = null;
    const postRef = doc(DB, "posts", postID);
    await runTransaction(DB, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (postSnap.exists()) {
        const userID: string = postSnap.data().user;
        const userRef = doc(DB, "user_collection", userID);
        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          const user: UserModel = {
            id: userSnap.id,
            email: userSnap.data().email,
            first: userSnap.data().first,
            isPublic: userSnap.data().isPublic,
            last: userSnap.data().last,
            number: userSnap.data().number,
          };
          const downloadPromises: Array<Promise<void>> = [];
          const images: JSX.Element[] = [];
          for (let index = 0; index < postSnap.data().image; index++) {
            const storageRef = ref(STORAGE, `posts/${postSnap.id}/${index}`);
            const promise = getDownloadURL(storageRef)
              .then((url) => {
                images[index] = (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    cachePolicy={"memory-disk"}
                    placeholder={BLURHASH}
                    style={{
                      height: 100,
                      width: 100,
                      borderColor: "black",
                      borderRadius: 10,
                      borderWidth: 1,
                      marginRight: 10,
                    }}
                  />
                );
              })
              .catch((error) => {
                console.error("Error fetching image ", error);
              });
            downloadPromises.push(promise);
          }
          await Promise.all(downloadPromises);
          post = {
            id: postSnap.id,
            bookid: postSnap.data().bookid,
            booktitle: postSnap.data().booktitle,
            created: postSnap.data().created,
            text: postSnap.data().text,
            user,
            images,
            likes: postSnap.data().likes ?? [],
            comments: (postSnap.data().comments as CommentModel[]) ?? [],
            oldBookmark: postSnap.data().oldBookmark,
            newBookmark: postSnap.data().newBookmark,
            totalPages: postSnap.data().totalPages,
          };
        }
      }
    });
    return post;
  } catch (error) {
    console.error("Error fetching users feed", error);
    return null;
  }
}

/**
 * Retrieves posts for every user the provided user is following,
 * including pagination support.
 * Combines getAllFollowing(), fetchPostsByUserID(), and sortPostsByDate() functions.
 * @param {string} userID - The ID of the user for whom to retrieve posts.
 * @param {QueryDocumentSnapshot<DocumentData, DocumentData> | null} [lastVisible=null] - The last visible document snapshot.
 * @returns {Promise<{
 *   posts: PostModel[]; // A list of fetched posts.
 *   newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null; // The new last visible document snapshot.
 * }>} A promise that resolves to an object containing the fetched posts and the new last visible document snapshot.
 */
export async function fetchPostsForUserFeed(
  userID: string,
  lastVisible?: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
): Promise<{
  posts: PostModel[];
  newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}> {
  try {
    const following = await getAllFollowing(userID);
    if (following.length === 0) {
      return { posts: [], newLastVisible: null };
    } else {
      const { posts, newLastVisible } = await fetchPostsByUserIDs(
        following,
        lastVisible,
      );
      return { posts, newLastVisible };
    }
  } catch (error) {
    console.error("Error fetching users feed", error);
    return { posts: [], newLastVisible: null };
  }
}

/**
 * Either removes or adds a like to a post
 * @param {string} userID - The ID of the user liking/unliking.
 * @param {string} postID - The ID of post being liked/unliked.
 * @returns {Promise<string[] | null>} A promise that resolves to an object containing the updated likes or null if the post doesnt exist.
 */
export async function likeUnlikePost(
  userID: string,
  postID: string,
): Promise<string[] | null> {
  try {
    const post = await fetchPostByPostID(postID);
    let updatedLikes: string[] | null = null;
    if (post != null) {
      const postRef = doc(DB, "posts", postID);
      await runTransaction(DB, async (transaction) => {
        const postSnap = await transaction.get(postRef);
        if (postSnap.exists()) {
          const likes = (postSnap.data().likes as string[]) ?? [];
          if (likes.includes(userID)) {
            likes.splice(likes.indexOf(userID), 1);
          } else {
            likes.push(userID);
          }
          transaction.update(postRef, { likes });
          updatedLikes = likes;
        }
      });
    }
    return updatedLikes;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Updates a post by adding a new comment.
 * @param {string} userID - The ID of the user commenting.
 * @param {string} postID - The ID of post being commented on.
 * @param {string} commentText - The text being commented.
 * @returns {Promise<CommentModel[] | null>} A promise that resolves to an object containing the updated comments or null if the post doesnt exist.
 */
export async function addCommentToPost(
  userID: string,
  postID: string,
  commentText: string,
): Promise<CommentModel[] | null> {
  try {
    const user = await fetchUser(userID);
    if (user != null) {
      const postRef = doc(DB, "posts", postID);
      let updatedComments: CommentModel[] | null = null;
      await runTransaction(DB, async (transaction) => {
        const postSnap = await transaction.get(postRef);
        if (postSnap.exists()) {
          const comments = (postSnap.data().comments as CommentModel[]) ?? [];
          comments.push({
            userID,
            first: user.first,
            text: commentText,
          });
          transaction.update(postRef, { comments });
          updatedComments = comments;
        }
      });
      return updatedComments;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
