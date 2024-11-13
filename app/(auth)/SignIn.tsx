import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  Keyboard,
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
  const passwordRef = useRef<TextInput>(null);

  if (isLoading) {
    return (
      <View>
        <Image
          source={require("../../assets/bookworm-splash-screen.png")}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
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
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="off"
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="next"
          onChangeText={(text) => {
            setEmail(text);
          }}
          onSubmitEditing={() => {
            passwordRef.current?.focus();
          }}
        />
        <TextInput
          ref={passwordRef}
          onSubmitEditing={() => {
            signIn(email, password);
          }}
          style={styles.input}
          value={password}
          secureTextEntry={true}
          placeholder="password"
          textContentType="password"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          returnKeyType="go"
          onChangeText={(text) => {
            setPassword(text);
          }}
        />
        <BookWormButton
          title="Login"
          onPress={() => {
            signIn(email, password);
          }}
        />
        <View style={styles.accountContainer}>
          <Text style={styles.question}>{"Don't have an account?"}</Text>
          <BookWormButton
            title="Create Account"
            style={{
              backgroundColor: APP_BACKGROUND_COLOR,
              flex: 1,
              marginVertical: 0,
              marginHorizontal: 0,
            }}
            textStyle={styles.createButtonText}
            onPress={() => {
              Keyboard.dismiss();
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
    fontSize: 15,
    fontWeight: "bold",
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
