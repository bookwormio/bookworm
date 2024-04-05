import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../components/auth/context";
import { updateUserInfo } from "../../services/firebase-services/queries";

const MoreInfo = () => {
  const { user, setNewUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");

  const validFields = () => {
    const missingFields: string[] = [];
    if (username === "") {
      missingFields.push("Username");
    }
    if (first === "") {
      missingFields.push("First Name");
    }
    if (last === "") {
      missingFields.push("Last Name");
    }
    if (phone === "") {
      missingFields.push("Phone");
    }
    if (missingFields.length > 0) {
      Toast.show({
        type: "error",
        text1: "Please Complete the Following Fields:",
        text2: missingFields.join(", "),
      });
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast />
      <TextInput
        style={styles.input}
        value={username}
        placeholder="username"
        onChangeText={(text) => {
          setUsername(text);
        }}
        autoCorrect={false}
        autoComplete="off"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={first}
        placeholder="first name"
        onChangeText={(text) => {
          setFirst(text);
        }}
        autoCorrect={false}
        autoComplete="off"
      />
      <TextInput
        style={styles.input}
        value={last}
        placeholder="last name"
        onChangeText={(text) => {
          setLast(text);
        }}
        autoCorrect={false}
        autoComplete="off"
      />
      <TextInput
        style={styles.input}
        value={phone}
        placeholder="phone number"
        onChangeText={(text) => {
          setPhone(text);
        }}
      />
      <Button
        title="Confirm Account Information"
        onPress={() => {
          if (validFields()) {
            setLoading(true);
            updateUserInfo(user, username, first, last, phone)
              .catch((error) => {
                Toast.show({
                  type: "error",
                  text1: "Error Creating User Info",
                  text2: error,
                });
              })
              .finally(() => {
                setNewUser(false);
                setLoading(false);
              });
          }
        }}
      />
    </View>
  );
};

export default MoreInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  loading: {
    top: "50%",
  },
});
