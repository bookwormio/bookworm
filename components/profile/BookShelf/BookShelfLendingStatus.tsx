import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useUserID } from "../../auth/context";
import { formatUserFullName } from "../../notifications/util/notificationUtils";
import { useFetchFriendData } from "../../UserList/hooks/useFriendQueries";
import { useNavigateToUser } from "../hooks/useRouteHooks";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BookShelfLendingStatusProps {
  borrowingUserID: string;
}

const BookShelfLendingStatus = ({
  borrowingUserID,
}: BookShelfLendingStatusProps) => {
  const { userID } = useUserID();

  const { data: friendData, isLoading: friendIsLoading } =
    useFetchFriendData(borrowingUserID);

  const navigateToUser = useNavigateToUser();

  if (borrowingUserID === "" || friendIsLoading || friendData == null) {
    return null;
  }

  const userName = formatUserFullName(friendData?.first, friendData?.last);

  return (
    <View style={styles.container}>
      <Text style={sharedBookshelfStyles.subtitle}>
        Lending to{" "}
        <Text
          onPress={() => {
            navigateToUser(userID, borrowingUserID);
          }}
          style={[sharedBookshelfStyles.subtitle, styles.bold]}
        >
          {userName}
        </Text>
      </Text>
    </View>
  );
};

export default BookShelfLendingStatus;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 120,
  },
  bold: {
    fontWeight: "bold",
  },
});
