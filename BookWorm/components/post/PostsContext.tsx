import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import {
  createCommentNotification,
  createLikeNotification,
} from "../../services/firebase-services/NotificationQueries";
import {
  addCommentToPost,
  likeUnlikePost,
} from "../../services/firebase-services/PostQueries";
import {
  fetchUser,
  fetchUserData,
  getUserProfileURL,
} from "../../services/firebase-services/UserQueries";
import {
  type BasicNotification,
  type CommentModel,
  type PostModel,
  type UserDataModel,
} from "../../types";
import { useAuth } from "../auth/context";

const PostsContext = createContext<{
  posts: PostModel[];
  setPosts: (posts: PostModel[]) => void;
  likePost: (postID: string) => void;
  isLikePending: boolean;
  commentOnPost: (postID: string, comment: string) => void;
}>({
  posts: [],
  setPosts: () => null,
  likePost: () => null,
  isLikePending: false,
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

  // getting userdata
  const { data: userData } = useQuery({
    queryKey: user != null ? ["userdata", user.uid] : ["userdata"],
    queryFn: async () => {
      if (user != null) {
        const userdata = await fetchUserData(user);
        return userdata;
      } else {
        // Return default value when user is null
        return {};
      }
    },
  });

  // getting userIm
  const { data: userIm } = useQuery({
    queryKey: user != null ? ["profilepic", user.uid] : ["profilepic"],
    queryFn: async () => {
      if (user != null) {
        return await getUserProfileURL(user.uid);
      } else {
        return "";
      }
    },
  });

  const queryClient = useQueryClient();
  const commentNotifyMutation = useMutation({
    mutationFn: createCommentNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", ""],
      });
    },
  });

  const likeNotifyMutation = useMutation({
    mutationFn: createLikeNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", ""],
      });
    },
  });

  const handleComment = (postID: string, comment: string) => {
    addCommentMutation.mutate({ postID, comment });
    const postToUpdate = posts.find((post) => post.id === postID);
    const uData = userData as UserDataModel;
    if (postToUpdate !== undefined && user?.uid !== undefined) {
      const BNotify: BasicNotification = {
        user: postToUpdate.user.id,
        sender: user?.uid,
        sender_name: uData.first + " " + uData.last, // Use an empty string if user?.uid is undefined
        sender_img: userIm ?? "",
        comment: " " + comment,
        postID,
      };
      commentNotifyMutation.mutate(BNotify);
    }
  };

  const handleLike = (postID: string) => {
    likePostMutation.mutate({ postID });
    const postToUpdate = posts.find((post) => post.id === postID);
    const uData = userData as UserDataModel;
    if (postToUpdate !== undefined && user?.uid !== undefined) {
      const BNotify: BasicNotification = {
        user: postToUpdate.user.id,
        sender: user?.uid,
        sender_name: uData.first + " " + uData.last, // Use an empty string if user?.uid is undefined
        sender_img: userIm ?? "",
        comment: "",
        postID,
      };
      likeNotifyMutation.mutate(BNotify);
    }
  };

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
          handleLike(postID);
        },
        isLikePending: likePostMutation.isPending,
        commentOnPost: (postID: string, comment: string) => {
          handleComment(postID, comment);
        },
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export { PostsProvider };
