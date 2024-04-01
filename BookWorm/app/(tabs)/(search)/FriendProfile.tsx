import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  fetchFriendData,
  followUserByID,
  getIsFollowing,
  unfollowUserByID,
} from "../../../services/firebase-services/queries";
import { type UserData } from "../../../types";

enum LocalFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  LOADING = "loading",
}

const FriendProfile = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState("");
  const { user } = useAuth();
  const [followStatus, setFollowStatus] = useState<string>(
    LocalFollowStatus.LOADING,
  );
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

  const { data: friendData, isLoading: friendIsLoading } = useQuery({
    queryKey:
      friendUserID != null ? ["frienddata", friendUserID] : ["frienddata"],
    queryFn: async () => {
      if (friendUserID != null) {
        return await fetchFriendData(friendUserID);
      } else {
        // Return default value when user is null
        return {};
      }
    },
  });

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

  useEffect(() => {
    if (friendData !== undefined) {
      const setFriendData = friendData as UserData;
      if (setFriendData.first !== undefined) {
        setFirstName(setFriendData.first);
      }
      if (setFriendData.last !== undefined) {
        setLastName(setFriendData.last);
      }
      if (setFriendData.isPublic) {
        setStatus("Public Account");
      } else {
        setStatus("Private Account");
      }
    }
  }, [friendData]);

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

  if (friendIsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View>
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />
      <Text>User ID: {friendUserID}</Text>
      <Text>First: {firstName}</Text>
      <Text>Last: {lastName}</Text>
      <Text>Status: {status}</Text>
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

const styles = StyleSheet.create({
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
