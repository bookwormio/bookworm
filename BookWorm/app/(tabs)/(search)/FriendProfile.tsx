import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  followUserByID,
  getIsFollowing,
  unfollowUserByID,
} from "../../../services/firebase-services/queries";

enum LocalFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  LOADING = "loading",
}

const FriendProfile = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  const { user } = useAuth();
  const [followStatus, setFollowStatus] = useState<string>(
    LocalFollowStatus.LOADING,
  );
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const currentUserID = user?.uid;
        // TODO: error if undefined
        if (currentUserID === undefined || friendUserID === undefined) {
          console.error(
            "Either current user ID is undefined or friend user ID is undefined",
          );
        } else {
          const isFollowing = await getIsFollowing(currentUserID, friendUserID);
          setFollowStatus(
            isFollowing
              ? LocalFollowStatus.FOLLOWING
              : LocalFollowStatus.NOT_FOLLOWING,
          );
          setFollowStatusFetched(true); // Set follow status fetched
        }
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    void fetchFollowStatus();
  }, [user, friendUserID]);

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
    if (currentUserID === undefined || friendUserID === undefined) {
      console.error(
        "Either current user ID is undefined or friend user ID is undefined",
      );
      return;
    }

    try {
      // Immediately update the visual follow status before the db has been updated
      setFollowStatus(LocalFollowStatus.LOADING);
      setFollowStatusFetched(false);
      const followSucceeded = await followUserByID(currentUserID, friendUserID);
      setFollowStatus(
        followSucceeded
          ? LocalFollowStatus.FOLLOWING
          : LocalFollowStatus.NOT_FOLLOWING,
      );
      setFollowStatusFetched(true);
    } catch (error) {
      setFollowStatus("not following");
      console.error("Error occurred while following user:", error);
    }
  };

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
      const unfollowSucceeded = await unfollowUserByID(
        currentUserID,
        friendUserID,
      );
      setFollowStatus(
        unfollowSucceeded
          ? LocalFollowStatus.NOT_FOLLOWING
          : LocalFollowStatus.FOLLOWING,
      );
      setFollowStatusFetched(true);
    } catch (error) {
      setFollowStatus(LocalFollowStatus.FOLLOWING);
      console.error("Error occurred while unfollowing user:", error);
    }
  };

  return (
    <View>
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />
      <Text>User ID: {friendUserID}</Text>
      <Button
        title={
          followStatus === LocalFollowStatus.LOADING
            ? "Loading..."
            : followStatus === LocalFollowStatus.FOLLOWING
              ? "Following"
              : "Follow"
        }
        onPress={handleFollowButtonPressed}
        disabled={!followStatusFetched} // Disable button until follow status is fetched
      />
    </View>
  );
};
export default FriendProfile;
