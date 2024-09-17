import { useLocalSearchParams } from "expo-router";
import React from "react";
import ViewPost from "../../../../components/post/ViewPost";

const ViewPostFromProfile = () => {
  const { postID } = useLocalSearchParams();

  if (postID !== undefined && typeof postID === "string") {
    return <ViewPost postID={postID} fromProfile={true} />;
  }
};

export default ViewPostFromProfile;
