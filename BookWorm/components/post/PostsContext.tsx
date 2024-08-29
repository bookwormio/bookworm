import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  addCommentToPost,
  likeUnlikePost,
} from "../../services/firebase-services/PostQueries";
import { fetchUser } from "../../services/firebase-services/UserQueries";
import { type CommentModel, type PostModel } from "../../types";
import { useAuth } from "../auth/context";

const PostsContext = React.createContext<{
  posts: PostModel[];
  setPosts: (posts: PostModel[]) => void;
  likePost: (postID: string) => void;
  commentOnPost: (postID: string, comment: string) => void;
}>({
  posts: [],
  setPosts: () => null,
  likePost: () => null,
  commentOnPost: () => null,
});

export function usePosts() {
  return React.useContext(PostsContext);
}

interface PostsProviderProps {
  children: React.ReactNode;
}

interface LikeMutationProps {
  postID: string;
}

interface CommentMutationProps {
  postID: string;
  comment: string;
}

const PostsProvider = ({ children }: PostsProviderProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostModel[]>([]);

  const likeMutation = useMutation({
    mutationFn: async ({ postID }: LikeMutationProps) => {
      if (user != null) {
        const postToUpdate = posts.find((post) => post.id === postID);
        if (postToUpdate !== undefined) {
          const likesToUpdate = postToUpdate.likes;
          if (likesToUpdate.includes(user.uid)) {
            likesToUpdate.splice(likesToUpdate.indexOf(user.uid), 1);
          } else {
            likesToUpdate.push(user.uid);
          }
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postToUpdate.id
                ? { ...post, likes: likesToUpdate }
                : post,
            ),
          );
          return await likeUnlikePost(user.uid, postID);
        }
      }
    },
    onSuccess: (updatedLikes, variables) => {
      if (updatedLikes != null && updatedLikes !== undefined) {
        const updatedPost = posts.find((post) => post.id === variables.postID);
        if (updatedPost !== undefined) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === updatedPost.id
                ? { ...post, likes: updatedLikes }
                : post,
            ),
          );
        }
      }
    },
    onError: () => {
      console.error("Error liking post");
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postID, comment }: CommentMutationProps) => {
      if (user != null) {
        const currentUser = await fetchUser(user.uid);
        if (currentUser != null) {
          const postToUpdate = posts.find((post) => post.id === postID);
          if (postToUpdate !== undefined) {
            const commentsToUpdate = postToUpdate.comments;
            const temporaryComment: CommentModel = {
              userID: user.uid,
              first: currentUser.first,
              text: comment,
            };
            commentsToUpdate.push(temporaryComment);
            setPosts((prevPosts) =>
              prevPosts.map((post) =>
                post.id === postToUpdate.id
                  ? { ...post, comments: commentsToUpdate }
                  : post,
              ),
            );
            return await addCommentToPost(user.uid, postID, comment);
          }
        }
      }
    },
    onSuccess: async (updatedComments, variables) => {
      if (updatedComments != null) {
        const updatedPost = posts.find((post) => post.id === variables.postID);
        if (updatedPost !== undefined) {
          updatedPost.comments = updatedComments;
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === updatedPost.id
                ? { ...post, comments: updatedComments }
                : post,
            ),
          );
        }
      }
    },
    onError: () => {
      console.error("Error commenting on post");
    },
  });

  return (
    <PostsContext.Provider
      value={{
        posts,
        setPosts: (newPosts: PostModel[]) => {
          setPosts(newPosts);
        },
        likePost: (postID: string) => {
          likeMutation.mutate({ postID });
        },
        commentOnPost: (postID: string, comment: string) => {
          commentMutation.mutate({ postID, comment });
        },
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export { PostsProvider };
