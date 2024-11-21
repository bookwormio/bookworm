import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type CommentModel } from "../../types";
import { useUserID } from "../auth/context";
import { useNavigateToUser } from "../profile/hooks/useRouteHooks";

interface PostProps {
  comment: CommentModel;
}

const Comment = ({ comment }: PostProps) => {
  const { userID } = useUserID();
  const navigateToUser = useNavigateToUser();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigateToUser(userID, comment.userID);
        }}
        disabled={comment.userID === userID}
      >
        <Text style={styles.title}>{comment.first}:</Text>
      </TouchableOpacity>
      <Text style={styles.body}>{comment.text}</Text>
    </View>
  );
};

export default Comment;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "lightgrey",
  },
  title: {
    marginRight: 5,
    fontSize: 15,
    fontWeight: "bold",
  },
  body: {
    fontSize: 15,
  },
});
