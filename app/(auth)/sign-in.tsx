import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../components/auth/context";
import BookWormButton from "../../components/button/BookWormButton";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading } = useAuth();

  if (isLoading) {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: "center",
        padding: 40,
        justifyContent: "center",
      },
    });

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
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
          onSubmitEditing={() => {
            signIn(email, password);
            router.replace("/post");
          }}
          style={styles.input}
          value={password}
          secureTextEntry={true}
          placeholder="password"
          autoCapitalize="none"
          onChangeText={(text) => {
            setPassword(text);
          }}
        />
        <BookWormButton
          title="Login"
          onPress={() => {
            signIn(email, password);
            router.replace("/post");
          }}
        />
        <View style={styles.accountContainer}>
          <Text style={styles.question}>{"Don't have an account?"}</Text>
          <BookWormButton
            title="Create Account"
            style={{ backgroundColor: APP_BACKGROUND_COLOR, flex: 1 }}
            textStyle={styles.createButtonText}
            onPress={() => {
              router.push("/CreateAccount");
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  accountContainer: {
    flexDirection: "row", // Horizontal layout
    alignItems: "center", // Align items vertically
    justifyContent: "space-between", // Space between the inputs
    paddingHorizontal: 2, // Padding for the container
    flex: 1,
  },
  keyAvoidContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  createButtonText: {
    color: "#FB6D0B",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  container: {
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
  question: {
    fontSize: 16,
  },
});
