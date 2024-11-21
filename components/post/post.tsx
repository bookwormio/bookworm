import { type Timestamp } from "firebase/firestore";
import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type PostModel } from "../../types";

import {
  APP_BACKGROUND_COLOR,
  BOOKWORM_LIGHT_GREY,
} from "../../constants/constants";
import { useAuth } from "../auth/context";
import BadgeOnPost from "../badges/BadgeOnPost";
import { useGetBadgesForPost } from "../badges/useBadgeQueries";
import {
  useNavigateToBook,
  useNavigateToUser,
} from "../profile/hooks/useRouteHooks";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import { usePageValidation } from "./hooks/usePageValidation";
import PostImage from "./images/PostImage";
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
  const { user } = useAuth();
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
  const navigateToUser = useNavigateToUser();

  const navigateToBook = useNavigateToBook(post.bookid);

  const isCurrentUsersPost = user?.uid === post.user.id;

  const { data: badges } = useGetBadgesForPost(post.user.id, post.id);

  const filteredBadgesForPost =
    badges != null ? badges?.filter((badge) => badge.postID === post.id) : [];

  return (
    <ScrollView
      style={{ borderBottomWidth: 10, borderBottomColor: BOOKWORM_LIGHT_GREY }}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.profilePicContainer}>
            <TouchableOpacity
              disabled={isCurrentUsersPost}
              onPress={() => {
                navigateToUser(user?.uid, post.user.id);
              }}
            >
              <ProfilePicture userID={post.user.id} size={40} />
            </TouchableOpacity>
          </View>
          <View style={styles.textContainer}>
            {pagesObject != null &&
            pagesRead != null &&
            pagesObject.totalPages > 0 ? (
              <Text style={styles.title}>
                <Text
                  style={styles.userName}
                  onPress={() => {
                    navigateToUser(user?.uid, post.user.id);
                  }}
                  disabled={isCurrentUsersPost}
                >
                  {post.user.first} {post.user.last}
                </Text>
                {isBackwards ? " moved back " : " read "}
                <Text>{Math.abs(pagesRead)}</Text>
                {" pages"}
                {isBackwards ? " in " : " of "}
                {post.booktitle}
              </Text>
            ) : (
              <Text style={styles.title}>
                <Text
                  style={styles.userName}
                  onPress={() => {
                    navigateToUser(user?.uid, post.user.id);
                  }}
                  disabled={isCurrentUsersPost}
                >
                  {post.user.first} {post.user.last}
                </Text>
                {" was reading"} {post.booktitle}
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
        {filteredBadgesForPost.length > 0 && (
          <View style={{ paddingTop: 5 }}>
            {filteredBadgesForPost.map((badge) => (
              <View key={badge.badgeID} style={{ paddingRight: 40 }}>
                <BadgeOnPost size={50} badge={badge} userInfo={post.user} />
              </View>
            ))}
          </View>
        )}
        {post.imageStorageRefs.length > 0 && (
          <View style={{ marginTop: 10, height: 270 }}>
            <FlatList
              nestedScrollEnabled={true}
              scrollEnabled={true}
              data={post.imageStorageRefs}
              contentContainerStyle={styles.flatListContainer}
              showsHorizontalScrollIndicator={true}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                // This allows side scrolling anywhere in the image list
                <View onStartShouldSetResponder={() => true}>
                  <PostImage
                    key={index}
                    storageRef={item}
                    index={index}
                    onPress={index === 0 ? navigateToBook : undefined}
                  />
                </View>
              )}
            />
          </View>
        )}
      </View>
      <View style={{ backgroundColor: APP_BACKGROUND_COLOR }}>
        <LikeComment
          post={post}
          key={`${post.id}-${post.comments.length}-${post.likes.length}`}
          individualPage={individualPage}
          presentComments={presentComments}
        />
      </View>
    </ScrollView>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: APP_BACKGROUND_COLOR,
    width: "100%",
  },
  flatListContainer: {
    paddingBottom: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
  },
  userName: {
    fontWeight: "bold",
  },
  time: {
    marginTop: 5,
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
