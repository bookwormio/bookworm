import { type Timestamp } from "firebase/firestore";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { type PostModel } from "../../types";
import LikeComment from "./LikeComment";
import { usePostsContext } from "./PostsContext";
import PagesProgressBar from "./ProgressBar/PagesProgressBar";
import { areValidPageNumbers, formatDate } from "./util/postUtils";

interface PostProps {
  post: PostModel;
  created: Timestamp;
  currentDate: Date;
  individualPage: boolean;
  presentComments: (postID: string) => void;
}

const Post = ({
  post,
  created,
  currentDate,
  individualPage,
  presentComments,
}: PostProps) => {
  const { posts } = usePostsContext();
  const formattedDate = formatDate(created, currentDate);
  const currentPost = posts.find((p) => p.id === post.id);

  if (currentPost !== undefined) {
    post = currentPost;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {post.user.first} {post.user.last} was reading {post.booktitle}
      </Text>
      {post.oldBookmark != null &&
        post.newBookmark != null &&
        post.totalPages != null &&
        areValidPageNumbers(
          post.oldBookmark,
          post.newBookmark,
          post.totalPages,
        ) && (
          <PagesProgressBar
            oldBookmark={post.oldBookmark}
            newBookmark={post.newBookmark}
            totalPages={post.totalPages}
          />
        )}
      <Text style={styles.time}>{formattedDate}</Text>
      <Text style={styles.body}>{post.text}</Text>
      {post.images.length > 0 && (
        <ScrollView horizontal={true} style={{ marginVertical: 10 }}>
          {post.images.map((image, index) => (
            <View key={index}>{image}</View>
          ))}
        </ScrollView>
      )}
      <LikeComment
        post={post}
        key={`${post.id}-${post.comments.length}-${post.likes.length}`}
        individualPage={individualPage}
        presentComments={presentComments}
      />
    </View>
  );
};

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
  pendingOpacity: {
    opacity: 0.5,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 8,
  },
  button: {
    marginLeft: 10,
    backgroundColor: "#FB6D0B",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#fb6d0b80",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  textPadding: {
    paddingRight: 10,
  },
});
