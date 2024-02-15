import React, { type FC } from "react";
import { Text, View } from "react-native";

interface PostProps {
  user: string;
  title: string;
  rating: number;
  summary?: string;
}

const Post: FC<PostProps> = ({ user, title, rating, summary }: PostProps) => {
  return (
    <View>
      <Text>user: {user}</Text>
      <Text>title {title}</Text>
      <Text>rating: {rating}</Text>
      <Text>Summary: {summary}</Text>
    </View>
  );
};

export default Post;
