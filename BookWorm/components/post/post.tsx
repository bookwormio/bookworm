import { type Timestamp } from "firebase/firestore";
import React, { memo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { DAYS_OF_WEEK, MONTHS_OF_YEAR } from "../../constants/constants";
import { type PostModel } from "../../types";

interface PostProps {
  post: PostModel;
  created: Timestamp;
  currentDate: Date;
}

const formatDate = (created: Timestamp, currentDate: Date) => {
  const date = created.toDate();
  const day = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS_OF_YEAR[date.getMonth()];
  const dayNumber = date.getDate();
  const isToday =
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getDate() === currentDate.getDate();

  return isToday
    ? "Today"
    : `${day}, ${month} ${dayNumber} at ${date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`;
};

// Using memo here makes it so it re-renders only when the props passed to it change
const Post = memo(({ post, created, currentDate }: PostProps) => {
  const formattedDate = formatDate(created, currentDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {post.user.first} {post.user.last} was reading {post.book}
      </Text>
      <Text style={styles.time}>{formattedDate}</Text>
      <Text style={styles.body}>{post.text}</Text>
      {post.images.length > 0 && (
        <ScrollView horizontal={true} style={{ marginTop: 20 }}>
          {post.images.map((image, index) => (
            <View key={index}>{image}</View>
          ))}
        </ScrollView>
      )}
    </View>
  );
});

export default Post;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "lightgrey",
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
