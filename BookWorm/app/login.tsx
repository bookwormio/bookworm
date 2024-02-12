import { FIREBASE_AUTH } from "../firebase.config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { router } from "expo-router";
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
      if (user != null) {
        router.replace("/home");
      }
    });
    return unsubscribe;
  }, []);

  const handleSignIn = () => {
    setLoading(true);
    signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
      .then(() => {})
      .catch((error) => {
        alert(error);
      });
  };

  const handleSignUp = () => {
    setLoading(true);
    createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
      .then(() => {})
      .catch((error) => {
        alert(error);
      });
  };

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
      ></TextInput>
      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry={true}
        placeholder="password"
        autoCapitalize="none"
        onChangeText={(text) => {
          setPassword(text);
        }}
      ></TextInput>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button title="Login" onPress={handleSignIn} />
          <Button title="Create Account" onPress={handleSignUp} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 40,
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
