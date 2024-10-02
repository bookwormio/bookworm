import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { ServerNotificationType } from "../../enums/Enums";
import { createNotification } from "../../services/firebase-services/NotificationQueries";
import {
  addCommentToPost,
  likeUnlikePost,
} from "../../services/firebase-services/PostQueries";
import { fetchUser } from "../../services/firebase-services/UserQueries";
import {
  type CommentModel,
  type CommentNotification,
  type LikeNotification,
  type PostModel,
  type UserDataModel,
} from "../../types";
import { useAuth } from "../auth/context";

const PostsContext = createContext<{
  posts: PostModel[];
  setPosts: (posts: PostModel[]) => void;
  profilePosts: PostModel[];
  setProfilePosts: (posts: PostModel[]) => void;
  likePost: (postID: string) => void;
  isLikePending: (postID: string) => boolean;
  commentOnPost: (postID: string, comment: string) => void;
}>({
  posts: [],
  setPosts: () => null,
  profilePosts: [],
  setProfilePosts: () => null,
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
  // posts for the main feed
  const [posts, setPosts] = useState<PostModel[]>([]);
  // posts for the profile feed
  const [profilePosts, setProfilePosts] = useState<PostModel[]>([]);
  // list of postIDs with ongoing likes
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());
  // getting userdata
  const { data: userData } = useUserDataQuery(user?.uid);
  const queryClient = useQueryClient();

  /**
   * Parent function which creates a notification when a post is liked,
   * and sends a request to like/unlike a post
   * @param postID - the postID of the post to like/unlike
   */
  const handleLike = (postID: string) => {
    likePostMutation.mutate({ postID });
    const postToUpdate = posts.find((post) => post.id === postID);
    const uData = userData as UserDataModel;
    if (postToUpdate !== undefined && user?.uid !== undefined) {
      const BNotify: LikeNotification = {
        receiver: postToUpdate.user.id,
        sender: user?.uid,
        sender_name: uData.first + " " + uData.last, // Use an empty string if user?.uid is undefined
        postID,
        type: ServerNotificationType.LIKE,
      };
      likeNotifyMutation.mutate(BNotify);
    }
  };

  // Mutation for creating a notification when a new like added
  const likeNotifyMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  /**
   * Mutation for liking/unliking a post
   * @beforeMutation - modifies the likes of the post to instantly show users interaction
   * @mutation - sends firebase request to like/unlike post, adds post to list of pending likes
   * @afterMutation - updates the likes of the post to reflect the firebase response, removes post from pending likes
   * @param postID - the postID of the post to like/unlike
   */
  const likePostMutation = useMutation({
    mutationFn: async ({ postID }: LikePostMutationProps) => {
      if (user != null) {
        // Modifies the likes of the post on both the main feed and profile feed if they exist
        modifyLikes(postID, user.uid, posts, setPosts);
        modifyLikes(postID, user.uid, profilePosts, setProfilePosts);
        return await likeUnlikePost(user.uid, postID);
      }
    },
    onSuccess: (updatedLikes, variables) => {
      if (updatedLikes != null && updatedLikes !== undefined) {
        // Updates the likes of the post on both the main feed and profile feed with the firebase response
        updateLikes(variables.postID, updatedLikes, setPosts);
        updateLikes(variables.postID, updatedLikes, setProfilePosts);
      }
    },
    onMutate: ({ postID }) => {
      // add post to pending likes
      setPendingLikes((prev) => new Set(prev).add(postID));
    },
    onSettled: (_, __, { postID }) => {
      // remove post from pending likes
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

  /**
   * - Updates the likes of a post
   * @param postID - the postID of the post to like/unlike
   * @param likes - the new list of likes to update the post with
   * @param updatePosts - setter function for either posts or profilePosts
   */
  const updateLikes = (
    postID: string,
    likes: string[],
    updatePosts: (value: React.SetStateAction<PostModel[]>) => void,
  ) => {
    // finds the post and replaces current likes with the new list of likes
    updatePosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postID ? { ...post, likes } : post)),
    );
  };

  /**
   * - Modifies the likes of a post to reflect the users action
   * @param postID - the postID of the post to like/unlike
   * @param userID - the userID of who liked/unliked the post
   * @param postsToUpdate - either posts or profilePosts
   * @param updatePosts - setter function for either posts or profilePosts
   */
  const modifyLikes = (
    postID: string,
    userID: string,
    postsToUpdate: PostModel[],
    updatePosts: (value: React.SetStateAction<PostModel[]>) => void,
  ) => {
    const postToUpdate = postsToUpdate.find((post) => post.id === postID);
    if (postToUpdate !== undefined) {
      const likesToUpdate = postToUpdate.likes;
      if (likesToUpdate.includes(userID)) {
        likesToUpdate.splice(likesToUpdate.indexOf(userID), 1);
      } else {
        likesToUpdate.push(userID);
      }
      updateLikes(postID, likesToUpdate, updatePosts);
    }
  };

  /**
   * Parent function which creates a notification when a new comment is made,
   * and sends a firebase request to add the comment.
   * @param postID - the postID for the post being commented on.
   * @param comment - the text of the new comment.
   */
  const handleComment = (postID: string, comment: string) => {
    addCommentMutation.mutate({ postID, comment });
    const postToUpdate = posts.find((post) => post.id === postID);
    const uData = userData as UserDataModel;
    if (postToUpdate !== undefined && user?.uid !== undefined) {
      const BNotify: CommentNotification = {
        receiver: postToUpdate.user.id,
        sender: user?.uid,
        sender_name: uData.first + " " + uData.last, // Use an empty string if user?.uid is undefined
        type: ServerNotificationType.COMMENT,
        postID,
        comment,
      };
      commentNotifyMutation.mutate(BNotify);
    }
  };

  // Mutation for creating a notification when a new comment is made
  const commentNotifyMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", ""],
      });
    },
  });

  /**
   * Mutation for adding a comment to a post
   * @beforeMutation - modifies the comments of the post to instantly show users new comment
   * @mutation - sends firebase request to add comment to the post
   * @afterMutation - updates the comments of the post to reflect the firebase response
   * @param postID - the postID of the post to comment on
   * @param comment - the text of the new comment
   */
  const addCommentMutation = useMutation({
    mutationFn: async ({ postID, comment }: AddCommentMutationProps) => {
      if (user != null) {
        fetchUser(user.uid)
          .then(async (currentUser) => {
            if (currentUser != null) {
              const tempComment: CommentModel = {
                userID: user.uid,
                first: currentUser.first,
                text: comment,
              };
              modifyComments(postID, tempComment, posts, setPosts);
              modifyComments(
                postID,
                tempComment,
                profilePosts,
                setProfilePosts,
              );
              return await addCommentToPost(user.uid, postID, comment);
            }
          })
          .catch(() => {
            console.error("Error fetching user");
          });
      }
    },
    onSuccess: async (updatedComments, variables) => {
      if (updatedComments != null) {
        updateComments(variables.postID, updatedComments, setPosts);
        updateComments(variables.postID, updatedComments, setProfilePosts);
      }
    },
    onError: () => {
      console.error("Error commenting on post");
    },
  });

  /**
   * Updates the comments of a post
   * @param postID - the postID of the post whos comments are getting updated
   * @param newComments - the new list of comments to update the post with
   * @param updatePosts - setter function for either posts or profilePosts
   */
  const updateComments = (
    postID: string,
    newComments: CommentModel[],
    updatePosts: (value: React.SetStateAction<PostModel[]>) => void,
  ) => {
    updatePosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postID ? { ...post, newComments } : post,
      ),
    );
  };

  /**
   * Modifies the comments of a post to reflect the users new comment
   * @param postID - the postID of the post to comment on
   * @param newComment - the new comment to add to the post
   * @param postsToUpdate - either posts or profilePosts
   * @param updatePosts - setter function for either posts or profilePosts
   */
  const modifyComments = (
    postID: string,
    newComment: CommentModel,
    postsToUpdate: PostModel[],
    updatePosts: (value: React.SetStateAction<PostModel[]>) => void,
  ) => {
    const postToUpdate = postsToUpdate.find((post) => post.id === postID);
    if (postToUpdate !== undefined) {
      const commentsToUpdate = postToUpdate.comments;
      commentsToUpdate.push(newComment);
      updateComments(postID, commentsToUpdate, updatePosts);
    }
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        setPosts: (newPosts: PostModel[]) => {
          setPosts(newPosts);
        },
        profilePosts,
        setProfilePosts(newPosts: PostModel[]) {
          setProfilePosts(newPosts);
        },
        likePost: (postID: string) => {
          if (user != null) {
            handleLike(postID);
          }
        },
        isLikePending: (postID: string) => pendingLikes.has(postID),
        commentOnPost: (postID: string, comment: string) => {
          if (user != null) {
            handleComment(postID, comment);
          }
        },
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export { PostsProvider };
