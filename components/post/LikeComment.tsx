import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { type PostModel } from "../../types";
import { useAuth } from "../auth/context";
import BookWormButton from "../button/BookWormButton";
import Comment from "../comment/comment";
import { usePostsContext } from "./PostsContext";

interface LikeCommentProps {
  post: PostModel;
  key: string;
  individualPage: boolean;
  presentComments: (postID: string) => void;
}

export const LikeComment = ({
  post,
  individualPage,
  presentComments,
}: LikeCommentProps) => {
  const { user } = useAuth();
  const { likePost, isLikePending, commentOnPost } = usePostsContext();
  const [showCommentSection, setShowComments] = useState(individualPage);
  const [newComment, setNewComment] = useState("");
  const isThisPostLikePending = isLikePending(post.id);

  return (
    <View>
      <View style={styles.buttonrow}>
        <TouchableOpacity
          disabled={isThisPostLikePending}
          style={[
            styles.likebutton,
            isThisPostLikePending && styles.pendingOpacity,
          ]}
          onPress={() => {
            likePost(post.id);
          }}
        >
          {post.likes.includes(user?.uid ?? "") ? (
            <FontAwesome5 name="heart" solid size={21} color="red" />
          ) : (
            <FontAwesome5 name="heart" size={21} />
          )}
        </TouchableOpacity>
        <Text
          style={[
            styles.textPadding,
            isThisPostLikePending && styles.pendingOpacity,
            styles.textFontSize,
          ]}
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
          <FontAwesome5 name="comment" size={21} />
          <Text style={styles.commentWrap}>
            {post.comments.length}
            {post.comments.length === 1 ? " Comment" : " Comments"}
          </Text>
        </TouchableOpacity>
      </View>
      {showCommentSection && (
        <>
          {post.comments.map(
            (comment, index) =>
              comment != null && <Comment key={index} comment={comment} />,
          )}
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
            <BookWormButton
              title="Comment"
              onPress={() => {
                commentOnPost(post.id, newComment);
                setNewComment("");
              }}
              disabled={newComment.trim() === ""}
              style={{ paddingHorizontal: 0, maxWidth: 100 }}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default LikeComment;

const styles = StyleSheet.create({
  buttonrow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 20,
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
    marginTop: 0,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 8,
  },
  textPadding: {
    paddingRight: 10,
  },
  textFontSize: {
    fontSize: 14.5,
  },
  commentWrap: { paddingLeft: 5, fontSize: 14.5 },
});
