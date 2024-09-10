import React, { useState } from "react";
import { View } from "react-native";
import BookSearch from "../searchbar/booksearch";

interface FriendIDProp {
  friendUserID: string;
}

const RecommendationPage = ({ friendUserID }: FriendIDProp) => {
  const [searchPhrase, setSearchPhrase] = useState("");
  const setParentSearchPhrase = (search: string) => {
    setSearchPhrase(search);
  };
  return (
    <View style={{ flex: 1 }}>
      <BookSearch
        searchPhrase={searchPhrase}
        setSearchPhrase={setParentSearchPhrase}
        friendUserID={friendUserID}
      />
    </View>
  );
};

// const styles = StyleSheet.create({});

export default RecommendationPage;
