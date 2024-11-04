import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { useAuth } from "../auth/context";
import { useGetIsFollowing } from "../followdetails/useFollowDetailQueries";

enum LocalFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  LOADING = "loading",
}

interface FollowButtonProps {
  friendUserID: string;
}

// todo add all the necessary loading stuff etc
// todo add styles
const FollowButon = ({ friendUserID }: FollowButtonProps) => {
  const { user } = useAuth();

  const { data: isFollowingData, isLoading: isLoadingIsFollowingData } =
    useGetIsFollowing(user?.uid ?? "", friendUserID);

  const [followStatus, setFollowStatus] = useState<string>(
    LocalFollowStatus.LOADING,
  );
  const [followStatusFetched, setFollowStatusFetched] =
    useState<boolean>(false);

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
  </TouchableOpacity>;
};

export default FollowButon;
