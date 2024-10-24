import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { ServerNotificationType, TabNames } from "../../enums/Enums";
import {
  followUserByID,
  unfollowUserByID,
} from "../../services/firebase-services/FriendQueries";
import { createNotification } from "../../services/firebase-services/NotificationQueries";
import { fetchFriendData } from "../../services/firebase-services/UserQueries";
import {
  type ConnectionModel,
  type FriendRequestNotification,
  type UserDataModel,
} from "../../types";
import { useAuth } from "../auth/context";
import {
  useGetIsFollowing,
  useGetNumberOfFollowersByUserID,
  useGetNumberOfFollowingByUserID,
} from "../followdetails/useFollowDetailQueries";
import ProfileBookShelves from "../profile/BookShelf/ProfileBookShelves";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import ProfileTabSelector from "../profile/ProfileTabSelector";
import WormLoader from "../wormloader/WormLoader";

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
  const { user } = useAuth();
  const [profileTab, setProfileTab] = useState("shelf");
  const [followStatus, setFollowStatus] = useState<string>(
    LocalFollowStatus.LOADING,
  );
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data: friendData, isLoading: friendIsLoading } = useQuery({
    queryKey: ["frienddata", friendUserID],
    enabled: friendUserID != null,
    queryFn: async () => {
      return await fetchFriendData(friendUserID);
    },
    staleTime: 60000, // Set stale time to 1 minute
  });

  // getting userdata
  const { data: userData, isLoading: isLoadingUserData } = useUserDataQuery(
    user?.uid,
  );

  const { data: isFollowingData } = useGetIsFollowing(
    user?.uid ?? "",
    friendUserID,
  );

  const { data: numFollowersData } = useGetNumberOfFollowersByUserID(
    friendUserID ?? "",
  );

  const { data: numFollowingData } = useGetNumberOfFollowingByUserID(
    friendUserID ?? "",
  );

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
      const setFriendData = friendData;
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
      userData == null
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
          sender_name: userData.first + " " + userData.last,
          type: ServerNotificationType.FRIEND_REQUEST,
        };
        notifyMutation.mutate(FRnotify);
      }
    } catch (error) {
      setFollowStatus(LocalFollowStatus.NOT_FOLLOWING);
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

  if (friendIsLoading || isLoadingUserData) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  return (
    <ScrollView
      stickyHeaderIndices={[4]}
      style={{
        flexGrow: 1,
        height: "100%",
        backgroundColor: APP_BACKGROUND_COLOR,
      }}
    >
      <View style={styles.buttonwrapper}></View>
      <View style={styles.imageTextContainer}>
        <View style={styles.profilePicContainer}>
          <ProfilePicture userID={friendUserID} size={60} />
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
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: `/follow/${friendUserID}?followersfirst=true`,
            });
          }}
        >
          <Text>Followers</Text>
          <Text>{numFollowersData ?? "-"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locText}
          onPress={() => {
            router.push({
              pathname: `/follow/${friendUserID}?followersfirst=false`,
            });
          }}
        >
          <Text>Following</Text>
          <Text>{numFollowingData ?? "-"}</Text>
        </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: `/recommendation/${friendUserID}`,
              });
            }}
          >
            <Text style={styles.buttonText}>Recommend</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ProfileTabSelector
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        tabs={[TabNames.BOOKSHELVES, TabNames.POSTS, TabNames.DATA]}
      />
      {profileTab === TabNames.BOOKSHELVES ? (
        <ProfileBookShelves userID={friendUserID} />
      ) : profileTab === TabNames.POSTS ? (
        <Text>PUT THE POSTS HERE</Text>
      ) : profileTab === TabNames.DATA ? (
        <Text>PUT DATA HERE</Text>
      ) : (
        <Text>Tab DNE</Text>
      )}
    </ScrollView>
  );
};
export default FriendProfile;

const styles = StyleSheet.create({
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
    paddingBottom: 10,
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
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  buttoncontainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingRight: 20,
    flex: 1,
    flexDirection: "column",
  },
  button: {
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FB6D0B",
    marginBottom: 10,
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
  profilePicContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
});
