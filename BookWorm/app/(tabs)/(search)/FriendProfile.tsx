import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  followUserByID,
  getIsFollowing,
  unfollowUserByID,
} from "../../../services/firebase-services/queries";

const FriendProfile = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  const { user } = useAuth();
  const [followStatus, setFollowStatus] = useState<string>("loading");
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const currentUserID = user?.uid;
        if (currentUserID != null && friendUserID != null) {
          const isFollowing = await getIsFollowing(currentUserID, friendUserID);
          setFollowStatus(isFollowing ? "following" : "not following");
          setFollowStatusFetched(true); // Set follow status fetched
        }
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    void fetchFollowStatus();
  }, [user, friendUserID]);

  // TODO: consolidate these functions into one
  const handleFollowButtonPressed = () => {
    if (followStatus === "loading") {
      // Do nothing if follow status is still loading
    } else if (followStatus === "following") {
      void handleUnfollow();
    } else if (followStatus === "not following") {
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
      setFollowStatus("loading");
      const followStatus = await followUserByID(currentUserID, friendUserID);

      console.log("Follow status:", followStatus);
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
      setFollowStatus("not following");
      const unfollowStatus = await unfollowUserByID(
        currentUserID,
        friendUserID,
      );
      console.log("Unfollow status:", unfollowStatus);
    } catch (error) {
      setFollowStatus("following");
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
          followStatus === "loading"
            ? "Loading..."
            : followStatus === "following"
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
