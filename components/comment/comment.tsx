import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type CommentModel } from "../../types";
import { useAuth } from "../auth/context";
import { useNavigateToUser } from "../profile/hooks/useRouteHooks";

interface PostProps {
  comment: CommentModel;
}

const Comment = ({ comment }: PostProps) => {
  const { user } = useAuth();
  const navigateToUser = useNavigateToUser(user?.uid, comment.userID);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigateToUser();
        }}
        disabled={comment.userID === user?.uid}
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
