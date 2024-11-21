import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type CommentModel } from "../../types";
import { useAuth } from "../auth/context";
import { useNavigateToUser } from "../profile/hooks/useRouteHooks";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";

interface PostProps {
  comment: CommentModel;
}

const Comment = ({ comment }: PostProps) => {
  const { user } = useAuth();
  const navigateToUser = useNavigateToUser();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigateToUser(user?.uid, comment.userID);
        }}
        disabled={comment.userID === user?.uid}
        style={styles.userInfo}
      >
        <ProfilePicture userID={comment.userID} size={35} />
        <Text style={styles.title}>{comment.first}: </Text>
      </TouchableOpacity>
      <Text style={styles.body}>{comment.text}</Text>
    </View>
  );
};

export default Comment;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    alignItems: "center",
    borderBottomColor: "lightgrey",
    padding: 10,
    paddingLeft: 15,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    paddingLeft: 8,
  },
  body: {
    fontSize: 15,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
});
