import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  APP_BACKGROUND_COLOR,
  BOOKWORM_ORANGE,
} from "../../../constants/constants";

const Settings = () => {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.settingsButtonContainer,
          { borderTopWidth: 1, flexDirection: "row" },
        ]}
        onPress={() => {
          if (user != null) {
            router.push({
              pathname: "EditProfile",
            });
          } else {
            console.error("User DNE");
          }
        }}
      >
        <AntDesign
          name={"edit"}
          size={25}
          color="black"
          style={{ paddingRight: 10 }}
        />
        <Text style={styles.text}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingsButtonContainer, { flexDirection: "row" }]}
        onPress={signOut}
      >
        <AntDesign
          name={"logout"}
          size={25}
          color="black"
          style={{ paddingRight: 10 }}
        />
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_BACKGROUND_COLOR,
    flex: 1,
  },
  text: {
    color: "black",
    fontWeight: "bold",
    fontSize: 17,
  },
  settingsButtonContainer: {
    width: "100%",
    padding: 14,
    alignSelf: "center",
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BOOKWORM_ORANGE,
  },
});

export default Settings;
