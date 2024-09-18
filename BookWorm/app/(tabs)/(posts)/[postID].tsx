import { useLocalSearchParams } from "expo-router";
import React from "react";
import ViewPost from "../../../components/post/ViewPost";

const ViewPostFromFeed = () => {
  const { postID } = useLocalSearchParams();

  if (postID !== undefined && typeof postID === "string") {
    return <ViewPost postID={postID} fromProfile={false} />;
  }
};

export default ViewPostFromFeed;
