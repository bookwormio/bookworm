import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAuth } from "../../components/auth/context";
import { updateUserInfo } from "../../services/firebase-services/queries";

export default function updateProfile() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { isLoading, user } = useAuth();
  const { container, input } = styles;

  if (isLoading) {
    return (
      <View style={container}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
  return (
    <View style={container}>
      <View>
        <Text>First Name</Text>
        <TextInput
          style={input}
          value={firstName}
          placeholder="First Name"
          autoCapitalize="none"
          onChangeText={(text) => {
            setFirstName(text);
          }}
        />
      </View>
      <View>
        <Text>Last Name</Text>
        <TextInput
          style={input}
          value={lastName}
          placeholder="Last Name"
          autoCapitalize="none"
          onChangeText={(text) => {
            setLastName(text);
          }}
        />
      </View>
      <View>
        <Text>Phone Number</Text>
        <TextInput
          style={input}
          value={phoneNumber}
          placeholder="phone number"
          autoCapitalize="none"
          onChangeText={(text) => {
            setPhoneNumber(text);
          }}
        />
      </View>
      <Button
        title="Update Profile"
        onPress={() => {
          updateUserInfo(user, firstName, lastName, phoneNumber)
            .then(() => {
              router.replace("/posts");
            })
            .catch((error) => {
              console.error("Error updating user info:", error);
              // Handle error here, e.g., show error message
            });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 40,
    justifyContent: "center",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
