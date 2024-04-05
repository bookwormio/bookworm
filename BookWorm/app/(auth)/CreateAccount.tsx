import React, { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../components/auth/context";
import { router } from "expo-router";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { createAccount } = useAuth();

  const validFields = () => {
    const missingFields: string[] = [];
    if (email === "") {
      missingFields.push("Email");
    }
    if (password === "") {
      missingFields.push("Password");
    }
    if (confirmPassword === "") {
      missingFields.push("Confirm Password");
    }
    if (missingFields.length > 0) {
      Toast.show({
        type: "error",
        text1: "Please Complete the Following Fields:",
        text2: missingFields.join(", "),
      });
      return false;
    } else if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Do Not Match",
        text2: "Please ensure both passwords are the same",
      });
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <Toast />
      <TextInput
        style={styles.input}
        value={email}
        placeholder="email"
        autoCapitalize="none"
        onChangeText={(text) => {
          setEmail(text);
        }}
      />
      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry={true}
        placeholder="password"
        autoCapitalize="none"
        onChangeText={(text) => {
          setPassword(text);
        }}
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        secureTextEntry={true}
        placeholder="confirm password"
        autoCapitalize="none"
        onChangeText={(text) => {
          setConfirmPassword(text);
        }}
      />
      <Button
        title="Create Account"
        onPress={() => {
          if (validFields()) {
            createAccount(email, password);
            router.push("/MoreInfo");
          }
        }}
      />
    </View>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
