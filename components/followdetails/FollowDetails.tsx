import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { TabNames } from "../../enums/Enums";
import ProfileTabSelector from "../profile/ProfileTabSelector";
import UserList from "../UserList/UserList";
import WormLoader from "../wormloader/WormLoader";
import {
  useGetFollowersByID,
  useGetFollowingByID,
} from "./useFollowDetailQueries";

interface UserProp {
  userID: string;
  followersfirst: string;
}

const FollowDetails = ({ userID, followersfirst }: UserProp) => {
  const [profileTab, setProfileTab] = useState(
    followersfirst === "true" ? "followers" : "following",
  );
  const { data: followers, isLoading: isLoadingFollowers } =
    useGetFollowersByID(userID);

  const { data: following, isLoading: isLoadingFollowing } =
    useGetFollowingByID(userID);

  if (isLoadingFollowers || followers === null || isLoadingFollowing) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileTabSelector
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        tabs={[TabNames.FOLLOWERS, TabNames.FOLLOWING]}
      />
      {profileTab === TabNames.FOLLOWERS ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {followers?.map((user) => (
            <View style={styles.userContainer} key={user.id}>
              <UserList users={[user]} showFollowStatus={true} />
            </View>
          ))}
          {isLoadingFollowers && (
            <View style={styles.loading}>
              <WormLoader style={{ width: 50, height: 50 }} />
            </View>
          )}
        </ScrollView>
      ) : profileTab === TabNames.FOLLOWING ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {following?.map((user) => (
            <View style={styles.userContainer} key={user.id}>
              <UserList users={[user]} showFollowStatus={true} />
            </View>
          ))}
          {isLoadingFollowing && (
            <View style={styles.loading}>
              <WormLoader style={{ width: 50, height: 50 }} />
            </View>
          )}
        </ScrollView>
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
  userContainer: {
    marginBottom: 2,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    padding: 10,
  },
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
  bottomLoading: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    width: "100%",
  },
});

export default FollowDetails;
