import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../components/auth/context";
import { updateUser } from "../../services/firebase-services/userQueries";
import { type UserDataModel } from "../../types";

const MoreInfo = () => {
  const { user, setNewUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

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
        bio,
        city,
        state,
        profilepic: image,
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

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyAvoidContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.container}>
          <Text style={styles.header}>A little bit about you...</Text>
          <Text style={styles.subheader}>
            Enter some details about yourself
          </Text>
          <Toast />
          <TouchableOpacity
            style={styles.defaultImageContainer}
            onPress={() => {
              pickImageAsync().catch((error) => {
                Toast.show({
                  type: "error",
                  text1: "Error selecting image: " + error,
                  text2: "Please adjust your media permissions",
                });
              });
            }}
          >
            {image !== "" ? (
              <Image source={{ uri: image }} style={styles.defaultImage} />
            ) : (
              <FontAwesome5 name="user" size={40} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={username}
            placeholder="Username"
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
            placeholder="First Name"
            onChangeText={(text) => {
              setFirst(text);
            }}
            autoCorrect={false}
            autoComplete="off"
          />
          <TextInput
            style={styles.input}
            value={last}
            placeholder="Last Name"
            onChangeText={(text) => {
              setLast(text);
            }}
            autoCorrect={false}
            autoComplete="off"
          />
          <TextInput
            style={styles.input}
            value={phone}
            placeholder="Phone Number"
            onChangeText={(text) => {
              setPhone(text);
            }}
          />
          <TextInput
            style={styles.input}
            value={bio}
            placeholder="Bio"
            multiline={true}
            onChangeText={(text) => {
              setBio(text);
            }}
          />
          <TextInput
            style={styles.input}
            value={city}
            placeholder="City"
            onChangeText={(text) => {
              setCity(text);
            }}
          />
          <TextInput
            style={styles.input}
            value={state}
            placeholder="State"
            onChangeText={(text) => {
              setState(text);
            }}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (validFields()) {
                createNewTracking();
              }
            }}
          >
            <Text style={styles.buttonText}>{"Let's Go"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MoreInfo;

const styles = StyleSheet.create({
  header: {
    fontSize: 35,
    paddingBottom: 20,
  },
  subheader: {
    fontSize: 16,
  },
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
  keyAvoidContainer: {
    flex: 1,
  },
  // had to add paddingBottom to scrollContainer so it can scroll further down
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 100,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingBottom: 5,
    fontSize: 16,
  },
  loading: {
    top: "50%",
  },
  defaultImageContainer: {
    backgroundColor: "#d3d3d3",
    height: 100,
    width: 100,
    borderColor: "black",
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    marginTop: 30,
  },
  defaultImage: {
    height: 100, // Adjust the size of the image as needed
    width: 100, // Adjust the size of the image as needed
    borderRadius: 50, // Make the image circular
  },
});
