import { useMutation } from "@tanstack/react-query";
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
import { updateUser } from "../../services/firebase-services/queries";
import { type UserDataModel } from "../../types";

const MoreInfo = () => {
  const { user, setNewUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");

  const accountInfoMutation = useMutation({
    mutationFn: updateUser,
  });

  const createNewTracking = () => {
    if (user !== undefined && user !== null) {
      setLoading(true);
      const accountInfo: UserDataModel = {
        id: user.uid,
        username,
        email: user.email ?? "",
        first,
        last,
        number: phone,
        isPublic: true,
      };
      accountInfoMutation.mutate(accountInfo);
      setNewUser(false);
      setLoading(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Current user is undefined",
      });
    }
  };

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
      />
      <TextInput
        style={styles.input}
        value={first}
        placeholder="first name"
        onChangeText={(text) => {
          setFirst(text);
        }}
      />
      <TextInput
        style={styles.input}
        value={last}
        placeholder="last name"
        onChangeText={(text) => {
          setLast(text);
        }}
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
            createNewTracking();
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
