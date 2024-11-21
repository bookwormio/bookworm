import AntDesign from "@expo/vector-icons/AntDesign";
import { router, Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import BackButton from "../../../components/buttons/BackButton";
import { BOOKWORM_ORANGE } from "../../../constants/constants";

const ProfileLayout = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack>
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: "Profile",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  router.push({ pathname: "settings" });
                }}
                disabled={false}
              >
                <AntDesign name={"setting"} size={25} color={BOOKWORM_ORANGE} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="EditProfile"
          options={{
            presentation: "modal",
            headerTitle: "Edit Profile",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: "Settings",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profilepost/[postID]"
          options={{
            headerShown: true,
            headerTitle: "Post",
            headerLeft: () => <BackButton waitForKeyBoardDismiss={true} />,
          }}
        />
        <Stack.Screen
          name="profilebook/[bookID]"
          options={{
            headerShown: true,
            headerTitle: "Book",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profilefollow/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Follow Details",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="user/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "User",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profilebadge/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Badges",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="GenerateRecommendationsPage"
          options={{
            headerShown: true,
            headerTitle: "Generate Recommendations",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profilerecommendation/[friendUserID]"
          options={{
            presentation: "modal",
            headerTitle: "Leave a Recommendation",
          }}
        />
        <Stack.Screen
          name="profilebooklist/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Book List",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profileimageblowup/[imageURL]"
          options={{
            presentation: "modal",
            headerShown: false,
            gestureEnabled: true,
            headerLeft: () => <BackButton />,
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
};

export default ProfileLayout;
