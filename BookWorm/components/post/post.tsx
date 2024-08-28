import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { type Timestamp } from "firebase/firestore";
import React, { memo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DAYS_OF_WEEK, MONTHS_OF_YEAR } from "../../constants/constants";
import {
  addCommentToPost,
  likeUnlikePost,
} from "../../services/firebase-services/PostQueries";
import { type CommentModel, type PostModel } from "../../types";
import { useAuth } from "../auth/context";
import Comment from "../comment/comment";

interface PostProps {
  post: PostModel;
  created: Timestamp;
  currentDate: Date;
  showComments: boolean;
  likePost: (postID: string, userID: string) => void;
  commentOnPost: (postID: string, userID: string, commentText: string) => void;
  presentComments: (postID: string) => void;
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
const Post = memo(
  ({
    post,
    created,
    currentDate,
    showComments,
    likePost,
    commentOnPost,
    presentComments,
  }: PostProps) => {
    const [showCommentSection, setShowComments] = useState(showComments);
    const [postComments, setPostComments] = useState<CommentModel[]>(
      post.comments,
    );
    const [newComment, setNewComment] = useState("");
    const isCommentEmpty = () => newComment.trim() === "";
    const formattedDate = formatDate(created, currentDate);
    const { user } = useAuth();

    const likeMutation = useMutation({
      mutationFn: async () => {
        if (user != null) {
          return await likeUnlikePost(user.uid, post.id);
        }
      },
      onError: () => {
        console.error("Error liking post");
      },
    });

    const commentMutation = useMutation({
      mutationFn: async () => {
        if (user != null) {
          return await addCommentToPost(user.uid, post.id, newComment);
        }
      },
      onSuccess: (updatedComments) => {
        if (updatedComments != null) {
          setNewComment("");
          setPostComments(updatedComments);
        }
      },
      onError: () => {
        console.error("Error commenting on post");
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
            {post.likes.includes(user?.uid ?? "") ? (
              <FontAwesome5 name="heart" solid size={15} color="red" />
            ) : (
              <FontAwesome5 name="heart" size={15} />
            )}
          </TouchableOpacity>
          <Text style={{ paddingRight: 10 }}>
            {post.likes.length}
            {post.likes.length === 1 ? " Like" : " Likes"}
          </Text>
          <TouchableOpacity
            style={styles.likebutton}
            onPress={() => {
              if (!showComments) {
                presentComments(post.id);
              } else {
                setShowComments(!showCommentSection);
              }
            }}
          >
            <FontAwesome5 name="comment" size={15} />
            <Text style={{ paddingLeft: 5 }}>
              {postComments.length}
              {postComments.length === 1 ? " Comment" : " Comments"}
            </Text>
          </TouchableOpacity>
        </View>
        {showCommentSection && (
          <>
            <FlatList
              data={postComments}
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
                  isCommentEmpty() && styles.buttonDisabled,
                ]}
                onPress={() => {
                  commentMutation.mutate();
                }}
                disabled={isCommentEmpty()}
              >
                <Text style={styles.buttonText}>Comment</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  },
);

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
});
