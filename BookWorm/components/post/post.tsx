import { type Timestamp } from "firebase/firestore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DAYS_OF_WEEK, MONTHS_OF_YEAR } from "../../constants/constants";
import { type PostModel } from "../../types";

interface PostProps {
  post: PostModel;
  created: Timestamp;
}

const Post = ({ post, created }: PostProps) => {
  const date = created.toDate();
  const day = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS_OF_YEAR[date.getMonth()];
  const dayNumber = date.getDate();
  const currentDate = new Date();
  const isToday =
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getDate() === currentDate.getDate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {post.user.first} {post.user.last} was reading {post.book}
      </Text>
      <Text style={styles.time}>
        {isToday ? "Today" : day + ", " + month + " " + dayNumber} at{" "}
        {date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}
      </Text>
      <Text style={styles.body}>{post.text}</Text>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
  },
  time: {
    fontSize: 13,
    fontWeight: "200",
  },
  body: {
    fontSize: 13,
    paddingTop: 10,
  },
});
