import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const FriendProfile = () => {
  const { firstname, lastname } = useLocalSearchParams();
  return (
    <View>
      <Text>First Name: {firstname}</Text>
      <Text>Last Name: {lastname} </Text>
    </View>
  );
};
export default FriendProfile;
