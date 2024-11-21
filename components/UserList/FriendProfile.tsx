import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useProfilePicQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { TabNames } from "../../enums/Enums";
import { fetchFriendData } from "../../services/firebase-services/UserQueries";
import {
  useGetNumberOfFollowersByUserID,
  useGetNumberOfFollowingByUserID,
} from "../followdetails/useFollowDetailQueries";
import ProfileBookShelves from "../profile/BookShelf/ProfileBookShelves";
import ViewData from "../profile/Data/ViewData";
import FriendProfilePosts from "../profile/FriendProfilePosts";
import {
  useNavigateToFollowList,
  useNavigateToImageBlowup,
} from "../profile/hooks/useRouteHooks";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import ProfileTabSelector from "../profile/ProfileTabSelector";
import { sharedProfileStyles } from "../profile/styles/SharedProfileStyles";
import WormLoader from "../wormloader/WormLoader";
import FollowButon from "./FollowButton";

interface FriendProfileProps {
  friendUserID: string;
}

const FriendProfile = ({ friendUserID }: FriendProfileProps) => {
  const [profileTab, setProfileTab] = useState("shelf");

  const navigateToFollowList = useNavigateToFollowList(friendUserID);

  const { data: friendData, isLoading: friendIsLoading } = useQuery({
    queryKey: ["frienddata", friendUserID],
    enabled: friendUserID != null,
    queryFn: async () => {
      return await fetchFriendData(friendUserID);
    },
    staleTime: 60000, // Set stale time to 1 minute
  });

  const { data: numFollowersData, isLoading: isLoadingNumFollowersData } =
    useGetNumberOfFollowersByUserID(friendUserID ?? "");

  const { data: numFollowingData, isLoading: isLoadingNumFollowingData } =
    useGetNumberOfFollowingByUserID(friendUserID ?? "");

  const { data: profilePic, isPending: profilePicPending } =
    useProfilePicQuery(friendUserID);
  const navigateToImageBlowup = useNavigateToImageBlowup();

  if (
    friendIsLoading ||
    friendData == null ||
    isLoadingNumFollowersData ||
    isLoadingNumFollowingData ||
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
          <ProfilePicture userID={friendUserID} size={60} />
        </TouchableOpacity>
        <View style={sharedProfileStyles.textAndCityMargin}>
          <Text style={sharedProfileStyles.nameText}>
            {friendData.first} {friendData.last}
          </Text>
          <Text style={sharedProfileStyles.locText}>
            {friendData.city === "" ? "" : friendData.city}
            {friendData.city !== "" && friendData.state !== "" ? ", " : ""}
            {friendData.state === "" ? "" : friendData.state}
          </Text>
        </View>
      </View>
      <View>
        <Text style={sharedProfileStyles.bioWrap}>{friendData.bio}</Text>
      </View>
      <View style={sharedProfileStyles.followTextContainer}>
        <TouchableOpacity
          style={sharedProfileStyles.textWrap}
          onPress={() => {
            navigateToFollowList(true);
          }}
        >
          <Text style={sharedProfileStyles.followTitle}>Followers</Text>
          <Text style={sharedProfileStyles.followAmount}>
            {numFollowersData ?? "-"}
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
            {numFollowingData ?? "-"}
          </Text>
        </TouchableOpacity>
        <View style={sharedProfileStyles.followButton}>
          <FollowButon friendUserID={friendData.id} />
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
        <FriendProfilePosts userID={friendUserID} />
      ) : profileTab === TabNames.DATA ? (
        <ViewData userID={friendUserID} />
      ) : (
        <Text>Tab DNE</Text>
      )}
    </ScrollView>
  );
};
export default FriendProfile;
