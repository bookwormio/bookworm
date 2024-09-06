import { FontAwesome5 } from "@expo/vector-icons";
import { type Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { type PostModel } from "../../types";
import { useAuth } from "../auth/context";
import Comment from "../comment/comment";
import { usePostsContext } from "./PostsContext";
import PagesProgressBar from "./ProgressBar/PagesProgressBar";
import { areValidPageNumbers, formatDate } from "./util/postUtils";

interface PostProps {
  post: PostModel;
  key: string;
  created: Timestamp;
  currentDate: Date;
  individualPage: boolean;
  presentComments: (postID: string) => void;
}

// Using memo here makes it so it re-renders only when the props passed to it change
const Post = ({
  post,
  created,
  currentDate,
  individualPage,
  presentComments,
}: PostProps) => {
  const { user } = useAuth();
  const { posts, likePost, isLikePending, commentOnPost } = usePostsContext();
  const [showCommentSection, setShowComments] = useState(individualPage);
  const [newComment, setNewComment] = useState("");
  const [shouldAnimateProgress, setShouldAnimateProgress] = useState(true);

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
            shouldAnimate={shouldAnimateProgress}
            setShouldAnimate={setShouldAnimateProgress}
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
      <View style={styles.buttonrow}>
        <TouchableOpacity
          disabled={isLikePending}
          style={[styles.likebutton, isLikePending && styles.pendingOpacity]}
          onPress={() => {
            likePost(post.id);
          }}
        >
          {post.likes.includes(user?.uid ?? "") ? (
            <FontAwesome5 name="heart" solid size={15} color="red" />
          ) : (
            <FontAwesome5 name="heart" size={15} />
          )}
        </TouchableOpacity>
        <Text
          style={[styles.textPadding, isLikePending && styles.pendingOpacity]}
        >
          {post.likes.length}
          {post.likes.length === 1 ? " Like" : " Likes"}
        </Text>
        <TouchableOpacity
          style={styles.likebutton}
          onPress={() => {
            if (individualPage) {
              setShowComments(!showCommentSection);
            } else {
              presentComments(post.id);
            }
          }}
        >
          <FontAwesome5 name="comment" size={15} />
          <Text style={{ paddingLeft: 5 }}>
            {post.comments.length}
            {post.comments.length === 1 ? " Comment" : " Comments"}
          </Text>
        </TouchableOpacity>
      </View>
      {showCommentSection && (
        <>
          <FlatList
            data={post.comments}
            renderItem={({ item: comment }) => <Comment comment={comment} />}
          />
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              placeholder={`Add a comment to ${post.user.first}'s post`}
              autoCapitalize="none"
              multiline
              onChangeText={(text) => {
                setNewComment(text);
              }}
            />
            <TouchableOpacity
              style={[
                styles.button,
                newComment.trim() === "" && styles.buttonDisabled,
              ]}
              onPress={() => {
                commentOnPost(post.id, newComment);
                setNewComment("");
              }}
              disabled={newComment.trim() === ""}
            >
              <Text style={styles.buttonText}>Comment</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
