import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const FriendProfile = () => {
  const { firstname, lastname } = useLocalSearchParams();
  return (
    <View>
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />
      <Text>First Name: {firstname}</Text>
      <Text>Last Name: {lastname} </Text>
    </View>
  );
};
export default FriendProfile;
