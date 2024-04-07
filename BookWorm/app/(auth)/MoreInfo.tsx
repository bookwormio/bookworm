import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

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
      <TextInput
        style={styles.input}
        value={bio}
        placeholder="bio"
        onChangeText={(text) => {
          setBio(text);
        }}
      />
      <TouchableOpacity
        style={styles.defaultImage}
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
          <FontAwesome5 name="image" size={20} />
        )}
      </TouchableOpacity>
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
  defaultImage: {
    backgroundColor: "#d3d3d3",
    height: 100,
    width: 100,
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
