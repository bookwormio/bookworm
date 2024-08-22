import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { type Timestamp } from "firebase/firestore";
import React, { memo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DAYS_OF_WEEK, MONTHS_OF_YEAR } from "../../constants/constants";
import { addLikeToPost } from "../../services/firebase-services/PostQueries";
import { type PostModel } from "../../types";
import { useAuth } from "../auth/context";

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
    ? `Today at ${date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`
    : `${day}, ${month} ${dayNumber} at ${date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`;
};

// Using memo here makes it so it re-renders only when the props passed to it change
const Post = memo(({ post, created, currentDate }: PostProps) => {
  const [postLikes, setPostLikes] = useState(post.likes);
  const formattedDate = formatDate(created, currentDate);
  const { user } = useAuth();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (user != null) {
        if (postLikes.includes(user.uid)) {
          postLikes.splice(postLikes.indexOf(user.uid), 1);
        } else {
          postLikes.push(user.uid);
        }
        addLikeToPost(user.uid, post.id)
          .then((updatedPost) => {
            if (updatedPost != null) {
              setPostLikes(updatedPost.likes);
            }
          })
          .catch(() => {
            console.error("Error liking post");
          });
      }
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {post.user.first} {post.user.last} was reading {post.booktitle}
      </Text>
      <Text style={styles.time}>{formattedDate}</Text>
      <Text style={styles.body}>{post.text}</Text>
      {post.images.length > 0 && (
        <ScrollView horizontal={true} style={{ marginVertical: 10 }}>
          {post.images.map((image, index) => (
            <View key={index}>{image}</View>
          ))}
        </ScrollView>
      )}
      <View style={styles.buttonrow}>
        <TouchableOpacity
          style={styles.likebutton}
          onPress={() => {
            likeMutation.mutate();
          }}
        >
          {postLikes.includes(user?.uid ?? "") ? (
            <FontAwesome5 name="heart" solid size={15} color="red" />
          ) : (
            <FontAwesome5 name="heart" size={15} />
          )}
        </TouchableOpacity>
        <Text style={{ paddingRight: 10 }}>
          {postLikes.length}
          {postLikes.length === 1 ? " Like" : " Likes"}
        </Text>
        <TouchableOpacity style={styles.likebutton}>
          <FontAwesome5 name="comment" size={15} />
          <Text style={{ paddingLeft: 5 }}>Comments</Text>
        </TouchableOpacity>
      </View>
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
  buttonrow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
  },
  likebutton: {
    flexDirection: "row",
    paddingRight: 5,
    alignItems: "center",
  },
});
