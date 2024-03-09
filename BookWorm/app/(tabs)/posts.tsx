import React from "react";
import Post from "../../components/post/post";

const Posts = () => {
  return (
    <>
      <Post
        user="user1"
        title="dummy post"
        rating={3.5}
        summary="this is a summary of that post"
      ></Post>
      <Post
        user="user2"
        title="dummy post 2"
        rating={4}
        summary="anotha"
      ></Post>
    </>
  );
};

export default Posts;
