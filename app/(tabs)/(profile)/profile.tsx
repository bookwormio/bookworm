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
import { useGetExistingEarnedBadges } from "../../../components/badges/useBadgeQueries";
import BookWormButton from "../../../components/button/BookWormButton";
import {
  useGetNumberOfFollowersByUserID,
  useGetNumberOfFollowingByUserID,
} from "../../../components/followdetails/useFollowDetailQueries";
import ProfileBookShelves from "../../../components/profile/BookShelf/ProfileBookShelves";
import ViewData from "../../../components/profile/Data/ViewData";
import { useNavigateToFollowList } from "../../../components/profile/hooks/useRouteHooks";
import ProfilePicture from "../../../components/profile/ProfilePicture/ProfilePicture";
import ProfilePosts from "../../../components/profile/ProfilePosts";
import ProfileTabSelector from "../../../components/profile/ProfileTabSelector";
import { sharedProfileStyles } from "../../../components/profile/styles/SharedProfileStyles";
import WormLoader from "../../../components/wormloader/WormLoader";
import { TabNames } from "../../../enums/Enums";
import { newFetchUserInfo } from "../../../services/firebase-services/UserQueries";

const Profile = () => {
  const { signOut, user } = useAuth();
  const [profileTab, setProfileTab] = useState("shelf"); // Default to bookshelf

  const navigateToFollowList = useNavigateToFollowList(user?.uid);

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userdata", user?.uid],
    enabled: user != null,
    queryFn: async () => {
      return await newFetchUserInfo(user?.uid ?? "");
    },
  });

  const { data: followersCount, isLoading: isLoadingFollowersCount } =
    useGetNumberOfFollowersByUserID(user?.uid ?? "");

  const { data: followingCount, isLoading: isLoadingFollowingCount } =
    useGetNumberOfFollowingByUserID(user?.uid ?? "");

  const { data: badges, isLoading: isLoadingBadges } =
    useGetExistingEarnedBadges(user?.uid ?? "");

  if (
    isLoadingUserData ||
    userData == null ||
    isLoadingFollowersCount ||
    isLoadingFollowingCount ||
    isLoadingBadges
  ) {
    return (
      <View style={sharedProfileStyles.loading}>
        <WormLoader />
      </View>
    );
  }
  console.log("badges", badges);

  return (
    <ScrollView
      stickyHeaderIndices={[4]}
      style={sharedProfileStyles.scrollContainer}
    >
      <View style={sharedProfileStyles.imageTextContainer}>
        <View style={sharedProfileStyles.defaultImageContainer}>
          <ProfilePicture userID={user?.uid ?? ""} size={60} />
        </View>
        <View>
          <Text style={sharedProfileStyles.nameText}>
            {userData.first} {userData.last}
          </Text>
          <Text style={sharedProfileStyles.locText}>
            {userData.city === "" ? "" : userData.city}
            {userData.city !== "" && userData.state !== "" ? ", " : ""}
            {userData.state === "" ? "" : userData.state}
          </Text>
        </View>
      </View>
      <View>
        <Text style={sharedProfileStyles.bioWrap}>{userData.bio}</Text>
      </View>
      <View style={sharedProfileStyles.imageTextContainer}>
        <TouchableOpacity
          style={sharedProfileStyles.textWrap}
          onPress={() => {
            navigateToFollowList(true);
          }}
        >
          <Text style={sharedProfileStyles.followTitle}>Followers</Text>
          <Text style={sharedProfileStyles.followAmount}>
            {followersCount ?? "-"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={sharedProfileStyles.textWrap}
          onPress={() => {
            navigateToFollowList(false);
          }}
        >
          <Text style={sharedProfileStyles.followTitle}>Following</Text>
          <Text style={sharedProfileStyles.followAmount}>
            {followingCount ?? "-"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={sharedProfileStyles.outerButtonsContainer}>
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
        <View /** style={styles.shelves} */>
          {/** <View style={{ paddingLeft: 40, paddingRight: 40 }}>
            <BookWormButton
              title="Generate Recommendations"
              onPress={() => {
                router.push("/GenerateRecommendationsPage");
              }}
            />
          </View> */}
          <ProfileBookShelves userID={user?.uid} />
        </View>
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
  shelves: {
    marginTop: 20,
  },
});
