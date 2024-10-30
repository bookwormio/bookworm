import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Keyboard, TouchableOpacity, View } from "react-native";

interface BackButtonProps {
  waitForKeyBoardDismiss?: boolean;
}

const BackButton = ({ waitForKeyBoardDismiss }: BackButtonProps) => {
  return (
    <View>
      {router.canGoBack() && (
        <TouchableOpacity
          style={{ paddingLeft: 10, paddingBottom: 2 }}
          disabled={!router.canGoBack()}
          onPress={() => {
            Keyboard.dismiss();
            if (waitForKeyBoardDismiss === true) {
              setTimeout(() => {
                router.back();
              }, 20);
            } else {
              router.back();
            }
          }}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#FB6D0B" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BackButton;
