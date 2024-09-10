import { Image } from "expo-image";
import { type Timestamp } from "firebase/firestore";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useProfilePicQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { type PostModel } from "../../types";

import { FontAwesome5 } from "@expo/vector-icons";
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

  const {
    data: profilePic,
    isPending: profilePicPending,
    isError: profilePicError,
  } = useProfilePicQuery(currentPost?.user?.id);

  // TODO make this a function
  const allPagesValid =
    post.oldBookmark != null &&
    post.newBookmark != null &&
    post.totalPages != null &&
    areValidPageNumbers(post.oldBookmark, post.newBookmark, post.totalPages);

  // TODO make pages check valid here
  const pagesRead = allPagesValid ? post.newBookmark - post.oldBookmark : null;
  const isBackwards = pagesRead != null && pagesRead < 0;

  if (currentPost !== undefined) {
    post = currentPost;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.defaultImageContainer}>
          {!profilePicPending && !profilePicError && profilePic !== null ? (
            <Image style={styles.defaultImage} source={{ uri: profilePic }} />
          ) : (
            <FontAwesome5 name="user" size={40} />
          )}
        </View>
        <View style={styles.textContainer}>
          {allPagesValid ? (
            <Text style={styles.title}>
              {post.user.first} {post.user.last}
              {isBackwards ? " moved back " : " read "}
              {/* TODO type safety */}
              <Text style={styles.numPages}>{Math.abs(pagesRead)}</Text>
              {" pages"}
              {isBackwards ? " in " : " of "}
              {post.booktitle}
            </Text>
          ) : (
            <Text style={styles.title}>
              {post.user.first} {post.user.last} was reading {post.booktitle}
            </Text>
          )}
          <Text style={styles.time}>{formattedDate}</Text>
        </View>
      </View>
      {/* TODO type safety */}
      {allPagesValid && (
        <PagesProgressBar
          oldBookmark={post.oldBookmark}
          newBookmark={post.newBookmark}
          totalPages={post.totalPages}
        />
      )}
      <Text style={styles.body}>{post.text}</Text>
      {/* TODO: add the book cover as the first image */}
      {post.images.length > 0 && (
        <View style={{ marginTop: 10, height: 270 }}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 1 }}
          >
            {post.images.map((image, index) => (
              <View key={index}>{image}</View>
            ))}
          </ScrollView>
        </View>
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
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
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
  numPages: {
    fontWeight: "bold",
  },
  defaultImageContainer: {
    backgroundColor: "#d3d3d3",
    height: 40,
    width: 40,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginRight: 10,
  },
  defaultImage: {
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
});
