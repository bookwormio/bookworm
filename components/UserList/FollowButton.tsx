import React from "react";
import { type TextStyle } from "react-native";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { FollowButtonDisplay, ServerNotificationType } from "../../enums/Enums";
import {
  type ConnectionModel,
  type FriendRequestNotification,
} from "../../types";
import { useAuth } from "../auth/context";
import BookWormButton from "../button/BookWormButton";
import {
  useFollowMutation,
  useGetIsFollowing,
  useUnfollowMutation,
} from "../followdetails/useFollowDetailQueries";
import { useCreateNotification } from "../notifications/hooks/useNotificationQueries";

interface FollowButtonProps {
  friendUserID: string;
  textStyle?: TextStyle;
}

const FollowButton = ({ friendUserID, textStyle }: FollowButtonProps) => {
  const { user } = useAuth();
  const currentUserID = user?.uid;
  const { data: currentUserData, isLoading: currentUserDataLoading } =
    useUserDataQuery(currentUserID);

  const myFullName = currentUserData?.first + " " + currentUserData?.last;

  const { data: isFollowing, isLoading: isLoadingFollowStatus } =
    useGetIsFollowing(user?.uid ?? "", friendUserID);

  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();
  const notifyMutation = useCreateNotification();

  const handleFollowButtonPressed = () => {
    if (isLoading) {
      return;
    }
    void (isFollowing === true ? handleUnfollow() : handleFollow());
  };

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
      followMutation.mutate({ connection });
      const notification: FriendRequestNotification = {
        receiver: friendUserID,
        sender: currentUserID,
        sender_name: myFullName,
        type: ServerNotificationType.FRIEND_REQUEST,
      };
      notifyMutation.mutate({ notification });
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
      unfollowMutation.mutate({ connection });
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const isLoading =
    isLoadingFollowStatus ||
    unfollowMutation.isPending ||
    followMutation.isPending ||
    currentUserDataLoading;

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
