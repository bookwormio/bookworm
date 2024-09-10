import { useMutation } from "@tanstack/react-query";
import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import {
  addCommentToPost,
  likeUnlikePost,
} from "../../services/firebase-services/PostQueries";
import { fetchUser } from "../../services/firebase-services/UserQueries";
import { type CommentModel, type PostModel } from "../../types";
import { useAuth } from "../auth/context";

const PostsContext = createContext<{
  posts: PostModel[];
  setPosts: (posts: PostModel[]) => void;
  likePost: (postID: string) => void;
  isLikePending: (postID: string) => boolean;
  commentOnPost: (postID: string, comment: string) => void;
}>({
  posts: [],
  setPosts: () => null,
  likePost: () => null,
  isLikePending: () => false,
  commentOnPost: () => null,
});

export function usePostsContext() {
  return useContext(PostsContext);
}

interface PostsProviderProps {
  children: ReactNode;
}

interface LikePostMutationProps {
  postID: string;
}

interface AddCommentMutationProps {
  postID: string;
  comment: string;
}

const PostsProvider = ({ children }: PostsProviderProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  const likePostMutation = useMutation({
    mutationFn: async ({ postID }: LikePostMutationProps) => {
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
    onMutate: ({ postID }) => {
      setPendingLikes((prev) => new Set(prev).add(postID));
    },
    onSettled: (_, __, { postID }) => {
      setPendingLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postID);
        return newSet;
      });
    },
    onError: () => {
      console.error("Error liking post");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ postID, comment }: AddCommentMutationProps) => {
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
          likePostMutation.mutate({ postID });
        },
        isLikePending: (postID: string) => pendingLikes.has(postID),
        commentOnPost: (postID: string, comment: string) => {
          addCommentMutation.mutate({ postID, comment });
        },
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export { PostsProvider };
