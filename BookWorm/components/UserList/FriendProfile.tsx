import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  followUserByID,
  getIsFollowing,
  unfollowUserByID,
} from "../../services/firebase-services/FriendQueries";
import { createFriendRequestNotification } from "../../services/firebase-services/NotificationQueries";
import {
  fetchFriendData,
  getNumberOfFollowersByUserID,
  getNumberOfFollowingByUserID,
  getUserProfileURL,
} from "../../services/firebase-services/UserQueries";
import {
  type BasicNotification,
  type ConnectionModel,
  type UserDataModel,
} from "../../types";
import { useAuth } from "../auth/context";

enum LocalFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  LOADING = "loading",
}

interface FriendProfileProps {
  friendUserID: string;
}

const FriendProfile = ({ friendUserID }: FriendProfileProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const { user } = useAuth();
  const [followStatus, setFollowStatus] = useState<string>(
    LocalFollowStatus.LOADING,
  );
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

  const queryClient = useQueryClient();

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
    staleTime: 60000, // Set stale time to 1 minute
  });

  const { data: isFollowingData } = useQuery({
    queryKey:
      user?.uid != null && friendUserID !== null
        ? ["followingstatus", friendUserID, user?.uid]
        : ["followingstatus"],
    queryFn: async () => {
      if (friendUserID != null && user?.uid != null) {
        return await getIsFollowing(user?.uid, friendUserID);
      } else {
        return null;
      }
    },
  });

  const { data: followersData } = useQuery({
    queryKey: ["followersdata"],
    queryFn: async () => {
      if (user != null) {
        const followersCount = await getNumberOfFollowersByUserID(friendUserID);
        return followersCount ?? 0;
      } else {
        return 0;
      }
    },
  });

  const { data: followingData } = useQuery({
    queryKey: ["followingdata"],
    queryFn: async () => {
      if (user != null) {
        const followingCount = await getNumberOfFollowingByUserID(friendUserID);
        return followingCount ?? 0;
      } else {
        return 0;
      }
    },
  });

  const followMutation = useMutation({
    mutationFn: followUserByID,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          user?.uid != null && friendUserID !== null
            ? ["followingstatus", friendUserID, user?.uid]
            : ["followingstatus"],
      });
      await queryClient.invalidateQueries({ queryKey: ["followersdata"] });
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
      await queryClient.invalidateQueries({ queryKey: ["followersdata"] });
      setFollowStatusFetched(true);
    },
  });

  const notifyMutation = useMutation({
    mutationFn: createFriendRequestNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", friendUserID],
      });
    },
  });

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

  useEffect(() => {
    if (friendData !== undefined) {
      const setFriendData = friendData as UserDataModel;
      if (setFriendData.first !== undefined) {
        setFirstName(setFriendData.first);
      }
      if (setFriendData.last !== undefined) {
        setLastName(setFriendData.last);
      }
      if (setFriendData.bio !== undefined) {
        setBio(setFriendData.bio);
      }
    }
  }, [friendData]);

  const { data: friendIm, isLoading: isLoadingIm } = useQuery({
    queryKey:
      friendUserID != null ? ["profilepic", friendUserID] : ["profilepic"],
    queryFn: async () => {
      if (friendUserID != null && friendUserID !== "") {
        return await getUserProfileURL(friendUserID);
      } else {
        return null;
      }
    },
  });

  useEffect(() => {
    if (friendIm !== undefined && friendIm !== null) {
      setImage(friendIm);
    }
  }, [friendIm]);

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
      const connection: ConnectionModel = {
        currentUserID,
        friendUserID,
      };
      followMutation.mutate(connection);
      if (user !== undefined && user !== null) {
        const FRnotify: BasicNotification = {
          user: friendUserID,
          message: "someone has followed you",
          sender_id: user?.uid, // Use an empty string if user?.uid is undefined
        };
        notifyMutation.mutate(FRnotify);
      }
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

  if (friendIsLoading || isLoadingIm) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.buttonwrapper}></View>
      <View style={styles.imageTextContainer}>
        <View style={styles.defaultImageContainer}>
          <Image
            source={
              image !== "" ? image : require("../../assets/default_profile.png")
            }
            style={styles.defaultImage}
            cachePolicy={"memory-disk"}
          />
        </View>
        <View>
          <Text style={styles.nameText}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.locText}>Salt Lake City, UT</Text>
        </View>
      </View>
      <View>
        <Text style={styles.bioPad}>{bio}</Text>
      </View>
      <View style={styles.imageTextContainer}>
        <View>
          <Text>Followers</Text>
          <Text>{followersData ?? "-"}</Text>
        </View>
        <View style={styles.locText}>
          <Text>Following</Text>
          <Text>{followingData ?? "-"}</Text>
        </View>
        <View style={styles.buttoncontainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleFollowButtonPressed}
            disabled={!followStatusFetched}
          >
            <Text style={styles.buttonText}>
              {followStatus === LocalFollowStatus.LOADING
                ? "Loading..."
                : followStatus === LocalFollowStatus.FOLLOWING
                  ? "Following"
                  : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default FriendProfile;

const styles = StyleSheet.create({
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
  },
  bioPad: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  nameText: {
    paddingLeft: 20,
    fontSize: 30,
    marginTop: -25,
  },
  locText: {
    paddingLeft: 20,
  },
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
  buttoncontainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 160,
    width: "100%",
  },
  button: {
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FB6D0B",
  },
  buttonText: {
    color: "#FB6D0B",
  },
  backButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    padding: 10,
  },
  buttonwrapper: {
    marginBottom: 8,
    alignItems: "flex-start",
  },
  defaultImageContainer: {
    backgroundColor: "#d3d3d3",
    height: 60,
    width: 60,
    borderColor: "black",
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  defaultImage: {
    height: 60, // Adjust the size of the image as needed
    width: 60, // Adjust the size of the image as needed
    borderRadius: 50, // Make the image circular
  },
});
