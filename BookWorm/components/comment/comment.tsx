import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { type CommentModel } from "../../types";

interface PostProps {
  comment: CommentModel;
}

const Comment = ({ comment }: PostProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        router.push({
          pathname: `/user/${comment.userID}`,
        });
      }}
    >
      <Text style={styles.title}>{comment.first}: </Text>
      <Text style={styles.body}>{comment.text}</Text>
    </TouchableOpacity>
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
