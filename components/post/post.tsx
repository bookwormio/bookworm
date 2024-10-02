import { type Timestamp } from "firebase/firestore";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type PostModel } from "../../types";

import { router } from "expo-router";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { generateUserRoute } from "../../utilities/routeUtils";
import { useAuth } from "../auth/context";
import { useNavigateToBook } from "../profile/hooks/useRouteHooks";
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

  const handleNavigateToUser = () => {
    const userRoute = generateUserRoute(user?.uid, post.user.id, undefined);
    if (userRoute != null) {
      router.push(userRoute);
    }
  };

  const navigateToBook = useNavigateToBook(post.bookid);

  const isCurrentUsersPost = user?.uid === post.user.id;

  return (
    <FlatList
      data={[post]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.profilePicContainer}>
              <TouchableOpacity
                disabled={isCurrentUsersPost}
                onPress={handleNavigateToUser}
              >
                <ProfilePicture userID={item.user.id} size={40} />
              </TouchableOpacity>
            </View>
            <View style={styles.textContainer}>
              {pagesObject != null &&
              pagesRead != null &&
              pagesObject.totalPages > 0 ? (
                <Text style={styles.title}>
                  <Text
                    style={styles.userName}
                    onPress={handleNavigateToUser}
                    disabled={isCurrentUsersPost}
                  >
                    {item.user.first} {item.user.last}
                  </Text>
                  {isBackwards ? " moved back " : " read "}
                  <Text>{Math.abs(pagesRead)}</Text>
                  {" pages"}
                  {isBackwards ? " in " : " of "}
                  {item.booktitle}
                </Text>
              ) : (
                <Text style={styles.title}>
                  <Text
                    style={styles.userName}
                    onPress={handleNavigateToUser}
                    disabled={isCurrentUsersPost}
                  >
                    {item.user.first} {item.user.last}
                  </Text>
                  {" was reading"} {item.booktitle}
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
          <Text style={styles.body}>{item.text}</Text>
          {item.images.length > 0 && (
            <View style={{ marginTop: 10, height: 270 }}>
              <FlatList
                nestedScrollEnabled={true}
                scrollEnabled={true}
                data={post.images}
                contentContainerStyle={styles.flatListContainer}
                showsHorizontalScrollIndicator={true}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  if (index === 0) {
                    return (
                      <TouchableOpacity onPress={navigateToBook}>
                        {item}
                      </TouchableOpacity>
                    );
                  }
                  return <View key={index}>{item}</View>;
                }}
              />
            </View>
          )}
          <LikeComment
            post={item}
            key={`${item.id}-${item.comments.length}-${item.likes.length}`}
            individualPage={individualPage}
            presentComments={presentComments}
          />
        </View>
      )}
    />
  );
};

export default Post;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderBottomWidth: 10.0,
    borderBottomColor: "#F2F2F2",
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
  firstImageStyle: {
    width: 180, // custom width
    height: 250, // custom height
    borderRadius: 2,
    overflow: "hidden", // Ensure the image is clipped to the border radius
  },
  defaultImageStyle: {
    width: 250,
    height: 250,
    borderRadius: 0,
    overflow: "hidden", // Ensure the image is clipped to the border radius
  },
  imageContainer: {
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
