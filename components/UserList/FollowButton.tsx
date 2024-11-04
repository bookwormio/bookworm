import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { type TextStyle } from "react-native";
import { ServerNotificationType } from "../../enums/Enums";
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

enum LocalFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  LOADING = "loading",
}

interface FollowButtonProps {
  friendUserID: string;
  myFullName: string;
  textStyle?: TextStyle;
}

// TODO: clean this bidness up
const FollowButton = ({
  friendUserID,
  myFullName,
  textStyle,
}: FollowButtonProps) => {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { data: isFollowingData, isLoading: isLoadingIsFollowingData } =
    useGetIsFollowing(user?.uid ?? "", friendUserID);

  const [followStatus, setFollowStatus] = useState<string>(
    LocalFollowStatus.LOADING,
  );
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

  useEffect(() => {
    if (user?.uid !== undefined && friendUserID !== undefined) {
      if (isFollowingData !== null && isFollowingData !== undefined) {
        setFollowStatus(
          isFollowingData
            ? LocalFollowStatus.FOLLOWING
            : LocalFollowStatus.NOT_FOLLOWING,
        );
        setFollowStatusFetched(true); // Set follow status fetched
      }
    }
  }, [isFollowingData]);
  const handleFollowButtonPressed = () => {
    if (followStatus === LocalFollowStatus.LOADING) {
      // Do nothing if follow status is still loading
    } else if (followStatus === LocalFollowStatus.FOLLOWING) {
      // if following -> unfollow
      void handleUnfollow();
    } else if (followStatus === LocalFollowStatus.NOT_FOLLOWING) {
      // if not following -> follow
      void handleFollow();
    }
  };

  const handleFollow = async () => {
    const currentUserID = user?.uid;
    if (
      currentUserID === undefined ||
      friendUserID === undefined ||
      myFullName == null
    ) {
      console.error(
        "Either current user ID is undefined or friend user ID is undefined",
      );
      return;
    }

    try {
      // Immediately update the visual follow status before the db has been updated
      setFollowStatus(LocalFollowStatus.LOADING);
      setFollowStatusFetched(false);
      const connection: ConnectionModel = {
        currentUserID,
        friendUserID,
      };
      followMutation.mutate(connection);
      if (user !== undefined && user !== null) {
        const FRnotify: FriendRequestNotification = {
          receiver: friendUserID,
          sender: user?.uid,
          sender_name: myFullName,
          type: ServerNotificationType.FRIEND_REQUEST,
        };
        notifyMutation.mutate(FRnotify);
      }
    } catch (error) {
      setFollowStatus(LocalFollowStatus.NOT_FOLLOWING);
      console.error("Error occurred while following user:", error);
    }
  };

  const handleInvalidateFollowDetails = async () => {
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
    ]);
  };

  const followMutation = useMutation({
    mutationFn: followUserByID,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          user?.uid != null && friendUserID !== null
            ? ["followingstatus", friendUserID, user?.uid]
            : ["followingstatus"],
      });
      await handleInvalidateFollowDetails();
      setFollowStatusFetched(true);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUserByID,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          user?.uid != null && friendUserID !== null
            ? ["followingstatus", friendUserID, user?.uid]
            : ["followingstatus"],
      });
      await handleInvalidateFollowDetails();
      setFollowStatusFetched(true);
    },
  });

  const notifyMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", friendUserID],
      });
    },
  });

  const handleUnfollow = async () => {
    const currentUserID = user?.uid;
    if (currentUserID === undefined || friendUserID === undefined) {
      console.error(
        "Either current user ID is undefined or friend user ID is undefined",
      );
      return;
    }

    try {
      setFollowStatus(LocalFollowStatus.LOADING);
      setFollowStatusFetched(false);
      const connection: ConnectionModel = {
        currentUserID,
        friendUserID,
      };
      unfollowMutation.mutate(connection);
    } catch (error) {
      setFollowStatus(LocalFollowStatus.FOLLOWING);
      console.error("Error occurred while unfollowing user:", error);
    }
  };

  return (
    <BookWormButton
      title={
        followStatus === LocalFollowStatus.LOADING
          ? "Loading..."
          : followStatus === LocalFollowStatus.FOLLOWING
            ? "Following"
            : "Follow"
      }
      textStyle={textStyle}
      disabled={!followStatusFetched}
      onPress={handleFollowButtonPressed}
    />
  );
};

export default FollowButton;
