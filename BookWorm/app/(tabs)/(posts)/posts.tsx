import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import Post from "../../../components/post/post";
import { fetchUsersFeed } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user != null) {
      fetchUsersFeed(user?.uid)
        .then((fetchedPosts) => {
          setPosts(fetchedPosts);
        })
        .catch((error) => {
          alert("Error fetching feed: " + error);
        });
    }
  }, []);

  return (
    <>
      {posts.map((post: PostModel, index: number) => (
        <View key={index}>
          <Post user={post.user.first} title={post.book} rating={0} />
        </View>
      ))}
    </>
  );
};

export default Posts;
