import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../components/auth/context";

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
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (validFields()) {
            try {
              createAccount(email, password);
              router.push("/MoreInfo");
            } catch (error) {
              console.error(error);
            }
          }
        }}
      >
        <Text style={styles.buttonText}>{"Create Account"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FB6D0B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
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
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingBottom: 5,
    fontSize: 16,
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
