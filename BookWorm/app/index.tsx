import { router } from "expo-router";
import { useSession } from "../ctx";
import { View, StyleSheet, TextInput, Button } from "react-native";
import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, createAccount } = useSession();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={email}
        placeholder="Email"
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
      <Button
        title="Login"
        onPress={() => {
          signIn(email, password);
        }}
      />
      <Button
        title="Create Account"
        onPress={() => {
          createAccount(email, password);
          router.replace("/posts");
        }}
      />
    </View>
  );
};

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

export default Login;
