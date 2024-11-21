import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserID } from "../../../components/auth/context";
import BookWormButton from "../../../components/buttons/BookWormButton";
import {
  useGetNumberOfFollowersByUserID,
  useGetNumberOfFollowingByUserID,
} from "../../../components/followdetails/useFollowDetailQueries";
import { hasAnyBooks } from "../../../components/newpost/util/bookShelfUtils";
import ProfileBookShelves from "../../../components/profile/BookShelf/ProfileBookShelves";
import ViewData from "../../../components/profile/Data/ViewData";
import { useGetBooksForBookshelves } from "../../../components/profile/hooks/useBookshelfQueries";
import {
  useNavigateToBadgePage,
  useNavigateToFollowList,
  useNavigateToImageBlowup,
} from "../../../components/profile/hooks/useRouteHooks";
import ProfilePicture from "../../../components/profile/ProfilePicture/ProfilePicture";
import ProfilePosts from "../../../components/profile/ProfilePosts";
import ProfileTabSelector from "../../../components/profile/ProfileTabSelector";
import { sharedProfileStyles } from "../../../components/profile/styles/SharedProfileStyles";
import WormLoader from "../../../components/wormloader/WormLoader";
import { TabNames } from "../../../enums/Enums";
import { newFetchUserInfo } from "../../../services/firebase-services/UserQueries";
import { useProfilePicQuery } from "./hooks/useProfileQueries";

const Profile = () => {
  const { userID } = useUserID();
  const [profileTab, setProfileTab] = useState("shelf"); // Default to bookshelf

  const navigateToFollowList = useNavigateToFollowList(userID);
  const { data: bookShelves } = useGetBooksForBookshelves(userID);

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userdata", userID],
    queryFn: async () => {
      return await newFetchUserInfo(userID);
    },
  });
  const { data: followersCount, isLoading: isLoadingFollowersCount } =
    useGetNumberOfFollowersByUserID(userID);

  const { data: followingCount, isLoading: isLoadingFollowingCount } =
    useGetNumberOfFollowingByUserID(userID);

  const { data: profilePic, isPending: profilePicPending } =
    useProfilePicQuery(userID);
  const navigateToImageBlowup = useNavigateToImageBlowup();

  const navigateToBadgePage = useNavigateToBadgePage(userID);
  if (
    isLoadingUserData ||
    userData == null ||
    isLoadingFollowersCount ||
    isLoadingFollowingCount ||
    profilePicPending
  ) {
    return (
      <View style={sharedProfileStyles.loading}>
        <WormLoader />
      </View>
    );
  }

  return (
    <ScrollView
      stickyHeaderIndices={[3]}
      style={sharedProfileStyles.scrollContainer}
    >
      <View style={sharedProfileStyles.imageTextContainer}>
        <TouchableOpacity
          style={sharedProfileStyles.defaultImageContainer}
          onPress={() => {
            if (profilePic != null && profilePic !== "") {
              navigateToImageBlowup(profilePic);
            }
          }}
        >
          <ProfilePicture userID={userID} size={60} />
        </TouchableOpacity>
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
      <View style={{ flexDirection: "row", width: "100%", flex: 1 }}>
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
        <TouchableOpacity
          style={styles.badgeContainer}
          onPress={navigateToBadgePage}
        >
          <Image
            style={styles.badgeImage}
            source={require("../../../assets/badges/badge_icon.png")}
            cachePolicy={"memory-disk"}
          />
        </TouchableOpacity>
      </View>
      <ProfileTabSelector
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        tabs={[TabNames.BOOKSHELVES, TabNames.POSTS, TabNames.DATA]}
      />
      {profileTab === TabNames.BOOKSHELVES ? (
        <View style={styles.shelves}>
          <View style={{ paddingLeft: 40, paddingRight: 40 }}>
            {hasAnyBooks(bookShelves) ? (
              <BookWormButton
                title="Generate Recommendations"
                onPress={() => {
                  router.push("/GenerateRecommendationsPage");
                }}
              />
            ) : (
              <BookWormButton
                title="Find Books"
                onPress={() => {
                  router.replace("/search");
                }}
              />
            )}
          </View>
          <ProfileBookShelves userID={userID} />
        </View>
      ) : profileTab === TabNames.POSTS ? (
        <ProfilePosts userID={userID} />
      ) : profileTab === TabNames.DATA ? (
        <ViewData userID={userID} />
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
  badgeImage: {
    width: 37,
    height: 37,
    resizeMode: "contain",
  },
  badgeContainer: {
    alignItems: "flex-end",
    flex: 1,
    width: "100%",
    paddingTop: 20,
    paddingRight: 14,
  },
});
