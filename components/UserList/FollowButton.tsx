import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { type TextStyle } from "react-native";
import { FollowButtonDisplay, ServerNotificationType } from "../../enums/Enums";
import {
  followUserByID,
  unfollowUserByID,
} from "../../services/firebase-services/FriendQueries";
import { createNotification } from "../../services/firebase-services/NotificationQueries";
import {
  type ConnectionModel,
  type FriendRequestNotification,
} from "../../types";
import { useAuth } from "../auth/context";
import BookWormButton from "../button/BookWormButton";
import { useGetIsFollowing } from "../followdetails/useFollowDetailQueries";

interface FollowButtonProps {
  friendUserID: string;
  myFullName: string;
  textStyle?: TextStyle;
}

const FollowButton = ({
  friendUserID,
  myFullName,
  textStyle,
}: FollowButtonProps) => {
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const currentUserID = user?.uid;

  const { data: isFollowing, isLoading: isLoadingFollowStatus } =
    useGetIsFollowing(user?.uid ?? "", friendUserID);

  const invalidateFollowQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["numfollowers", friendUserID],
      }),
      queryClient.invalidateQueries({
        queryKey: ["numfollowing", user?.uid],
      }),
      queryClient.invalidateQueries({
        queryKey: ["followers", friendUserID],
      }),
      queryClient.invalidateQueries({
        queryKey: ["following", user?.uid],
      }),
      queryClient.invalidateQueries({
        queryKey: ["followingstatus", friendUserID, user?.uid],
      }),
    ]);
  };

  const handleFollowButtonPressed = () => {
    if (isLoading) {
      return;
    }
    void (isFollowing === true ? handleUnfollow() : handleFollow());
  };

  const followMutation = useMutation({
    mutationFn: followUserByID,
    onSuccess: invalidateFollowQueries,
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUserByID,
    onSuccess: invalidateFollowQueries,
  });

  const notifyMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", friendUserID],
      });
    },
  });

  const handleFollow = async () => {
    if (currentUserID == null || friendUserID == null || myFullName == null) {
      console.error("Missing required user information");
      return;
    }

    const connection: ConnectionModel = {
      currentUserID,
      friendUserID,
    };

    try {
      followMutation.mutate(connection);
      const notification: FriendRequestNotification = {
        receiver: friendUserID,
        sender: currentUserID,
        sender_name: myFullName,
        type: ServerNotificationType.FRIEND_REQUEST,
      };
      notifyMutation.mutate(notification);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    if (currentUserID == null || friendUserID == null) {
      console.error("Missing required user information");
      return;
    }

    const connection: ConnectionModel = {
      currentUserID,
      friendUserID,
    };

    try {
      unfollowMutation.mutate(connection);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const isLoading =
    isLoadingFollowStatus ||
    unfollowMutation.isPending ||
    followMutation.isPending;

  const buttonTitle = isLoading
    ? FollowButtonDisplay.LOADING
    : isFollowing === true
      ? FollowButtonDisplay.FOLLOWING
      : FollowButtonDisplay.FOLLOW;

  return (
    <BookWormButton
      title={buttonTitle}
      textStyle={textStyle}
      disabled={isLoading}
      onPress={handleFollowButtonPressed}
    />
  );
};

export default FollowButton;
