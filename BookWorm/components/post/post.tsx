import { type Timestamp } from "firebase/firestore";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { type PostModel } from "../../types";

import { router } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import { usePageValidation } from "./hooks/usePageValidation";
import LikeComment from "./LikeComment";
import { usePostsContext } from "./PostsContext";
import PagesProgressBar from "./ProgressBar/PagesProgressBar";
import { formatDate } from "./util/postUtils";

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

  const validatePageNumbers = usePageValidation();

  const pagesObject = validatePageNumbers(
    post.oldBookmark,
    post.newBookmark,
    post.totalPages,
  );

  const pagesRead =
    pagesObject != null
      ? pagesObject.newBookmark - pagesObject.oldBookmark
      : null;
  const isBackwards = pagesRead != null && pagesRead < 0;

  if (currentPost !== undefined) {
    post = currentPost;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.profilePicContainer}
          onPress={() => {
            router.push({ pathname: `/user/${post.user.id}` });
          }}
        >
          <ProfilePicture userID={post.user.id} size={40} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          {pagesObject != null && pagesRead != null ? (
            <Text style={styles.title}>
              {post.user.first} {post.user.last}
              {isBackwards ? " moved back " : " read "}
              <Text>{Math.abs(pagesRead)}</Text>
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
      {pagesObject != null &&
        pagesRead != null &&
        pagesObject.totalPages > 0 && (
          <PagesProgressBar
            oldBookmark={pagesObject.oldBookmark}
            newBookmark={pagesObject.newBookmark}
            totalPages={pagesObject.totalPages}
            pagesRead={pagesRead}
            isBackwards={isBackwards}
          />
        )}
      <Text style={styles.body}>{post.text}</Text>
      {post.images.length > 0 && (
        <View style={{ marginTop: 10, height: 270 }}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 1 }}
          >
            {post.images.map((image, index) => {
              if (index === 0) {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      router.push({ pathname: `postsbook/${post.bookid}` });
                    }}
                  >
                    {image}
                  </TouchableOpacity>
                );
              }
              return <View key={index}>{image}</View>;
            })}
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
  profilePicContainer: {
    marginRight: 10,
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
