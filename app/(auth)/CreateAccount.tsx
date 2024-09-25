import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../components/auth/context";
import BookWormButton from "../../components/button/BookWormButton";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { createAccount } = useAuth();

  const validFields = () => {
    const missingFields: string[] = [];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email === "") {
      missingFields.push("Email");
    }
    if (password === "") {
      missingFields.push("Password");
    }
    if (confirmPassword === "") {
      missingFields.push("Confirm Password");
    }
    if (!emailPattern.test(email)) {
      Toast.show({
        type: "error",
        text1: "Incorrect Email Format",
        text2: "Please put in a valid email",
      });
      return false;
    } else if (missingFields.length > 0) {
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
    } else if (confirmPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password Too Short",
        text2: "Your password must be at least 6 characters long",
      });
      return false;
    }
    return true;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={true}
    >
      <View style={styles.container}>
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
          textContentType="oneTimeCode"
          placeholder="password"
          autoCapitalize="none"
          autoComplete="off"
          onChangeText={(text) => {
            setPassword(text);
          }}
          onSubmitEditing={() => {
            if (password.length < 6) {
              alert("Your password must be at least 6 characters long.");
            }
          }}
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          secureTextEntry={true}
          textContentType="oneTimeCode"
          placeholder="confirm password"
          autoCapitalize="none"
          autoComplete="off"
          onChangeText={(text) => {
            setConfirmPassword(text);
          }}
          onSubmitEditing={() => {
            if (validFields()) {
              try {
                createAccount(email, password);
                router.push("/MoreInfo");
              } catch (error) {
                console.error(error);
              }
            }
          }}
        />
        <BookWormButton
          title="Create Account"
          onPress={() => {
            if (validFields()) {
              try {
                createAccount(email, password);
                router.push("/MoreInfo");
              } catch (error) {
                console.error(error);
                router.back();
              }
            }
          }}
        />
      </View>
      <Toast />
    </ScrollView>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  keyAvoidContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  container: {
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
