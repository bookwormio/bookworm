import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { TabNames } from "../../enums/Enums";
import { getFollowersByUserID } from "../../services/firebase-services/UserQueries";
import ProfileTabSelector from "../profile/ProfileTabSelector";
import WormLoader from "../wormloader/WormLoader";

interface UserProp {
  userID: string;
  followersfirst: string;
}

const FollowDetails = ({ userID, followersfirst }: UserProp) => {
  const [profileTab, setProfileTab] = useState(
    followersfirst === "true" ? "followers" : "following",
  );
  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: userID != null ? ["followers", userID] : ["followers"],
    queryFn: async () => {
      if (userID != null) {
        return await getFollowersByUserID(userID);
      }
    },
  });
  if (isLoadingFollowers) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  // PROFILE_ROUTE_PREFIX/PROFILE_FOLLOW_PREFIX
  return (
    <View style={styles.container}>
      <ProfileTabSelector
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        tabs={[TabNames.FOLLOWERS, TabNames.FOLLOWING]}
      />
      {profileTab === TabNames.FOLLOWERS ? (
        <Text>Followers: </Text>
      ) : profileTab === TabNames.FOLLOWING ? (
        <Text>Following</Text>
      ) : (
        <Text>Tab DNE</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_BACKGROUND_COLOR,
    flex: 1,
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
});

export default FollowDetails;
