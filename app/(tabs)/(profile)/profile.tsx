import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import BookWormButton from "../../../components/button/BookWormButton";
import {
  useGetNumberOfFollowersByUserID,
  useGetNumberOfFollowingByUserID,
} from "../../../components/followdetails/useFollowDetailQueries";
import ProfileBookShelves from "../../../components/profile/BookShelf/ProfileBookShelves";
import ViewData from "../../../components/profile/Data/ViewData";
import ProfilePicture from "../../../components/profile/ProfilePicture/ProfilePicture";
import ProfilePosts from "../../../components/profile/ProfilePosts";
import ProfileTabSelector from "../../../components/profile/ProfileTabSelector";
import WormLoader from "../../../components/wormloader/WormLoader";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";
import { TabNames } from "../../../enums/Enums";
import { newFetchUserInfo } from "../../../services/firebase-services/UserQueries";

const Profile = () => {
  const { signOut, user } = useAuth();
  const [profileTab, setProfileTab] = useState("shelf"); // Default to bookshelf

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userdata", user?.uid],
    enabled: user != null,
    queryFn: async () => {
      return await newFetchUserInfo(user?.uid ?? "");
    },
  });

  const { data: followersCount } = useGetNumberOfFollowersByUserID(
    user?.uid ?? "",
  );

  const { data: followingCount } = useGetNumberOfFollowingByUserID(
    user?.uid ?? "",
  );

  if (isLoadingUserData || userData == null) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  return (
    <ScrollView stickyHeaderIndices={[4]} style={styles.scrollContainer}>
      <View style={styles.imageTextContainer}>
        <View style={styles.defaultImageContainer}>
          <ProfilePicture userID={user?.uid ?? ""} size={60} />
        </View>
        <View>
          <Text style={styles.nameText}>
            {userData.first} {userData.last}
          </Text>
          <Text style={styles.locText}>
            {userData.city === "" ? "" : userData.city}
            {userData.city !== "" && userData.state !== "" ? ", " : ""}
            {userData.state === "" ? "" : userData.state}
          </Text>
        </View>
      </View>
      <View>
        <Text style={styles.bioWrap}>{userData.bio}</Text>
      </View>
      <View style={styles.imageTextContainer}>
        <TouchableOpacity
          style={styles.textWrap}
          onPress={() => {
            router.push({
              pathname: `profilefollow/${user?.uid}?followersfirst=true`,
            });
          }}
        >
          <Text style={styles.followTitle}>Followers</Text>
          <Text style={styles.followAmount}>{followersCount ?? "-"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.textWrap}
          onPress={() => {
            router.push({
              pathname: `profilefollow/${user?.uid}?followersfirst=false`,
            });
          }}
        >
          <Text style={styles.followTitle}>Following</Text>
          <Text style={styles.followAmount}>{followingCount ?? "-"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.outerButtonsContainer}>
        <BookWormButton
          title="Edit Profile"
          onPress={() => {
            if (user != null) {
              router.push({
                pathname: "EditProfile",
              });
            } else {
              console.error("User DNE");
            }
          }}
        />
        <BookWormButton title="Log Out" onPress={signOut} />
      </View>
      <ProfileTabSelector
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        tabs={[TabNames.BOOKSHELVES, TabNames.POSTS, TabNames.DATA]}
      />
      {profileTab === TabNames.BOOKSHELVES && user !== null ? (
        <ProfileBookShelves userID={user?.uid} />
      ) : profileTab === TabNames.POSTS ? (
        <ProfilePosts userID={user?.uid ?? ""} />
      ) : profileTab === TabNames.DATA ? (
        <ViewData userID={user?.uid ?? ""} />
      ) : (
        <Text>Tab DNE</Text>
      )}
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    height: "100%",
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  outerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 2,
    backgroundColor: APP_BACKGROUND_COLOR,
    paddingBottom: 10,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
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
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
    marginTop: 20,
  },
  bioWrap: {
    paddingLeft: 30,
    paddingRight: 30,
    fontSize: 15,
    paddingBottom: 5,
  },
  nameText: {
    paddingLeft: 20,
    fontSize: 30,
    marginTop: -10,
  },
  locText: {
    paddingLeft: 20,
  },
  textWrap: {
    paddingLeft: 11,
    paddingBottom: 20,
  },
  defaultImageContainer: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  followTitle: { fontSize: 15 },
  followAmount: { fontSize: 18, fontWeight: "bold" },
});
