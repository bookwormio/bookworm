import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import {
  emptyQuery,
  getUserProfileURL,
  newFetchUserInfo,
  updateUser,
} from "../../../services/firebase-services/queries";
import { type UserDataModel } from "../../../types";

const EditProfile = () => {
  const { user } = useAuth();
  const [editPhone, setEditPhone] = useState("");
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editBio, setEditBio] = useState("");
  const [image, setImage] = useState("");

  const queryClient = useQueryClient();

  const userMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: user != null ? ["userdata", user.uid] : ["userdata"],
      });
    },
  });

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: user != null ? ["userdata", user.uid] : ["userdata"],
    queryFn: async () => {
      if (user != null) {
        return await newFetchUserInfo(user.uid);
      } else {
        // Return default value when user is null
        return {};
      }
    },
  });

  const refreshMutation = useMutation({
    mutationFn: emptyQuery,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: user != null ? ["userdata", user.uid] : ["userdata"],
      });
    },
  });

  const onClose = () => {
    refreshMutation.mutate();
  };

  useEffect(() => {
    if (userData !== undefined) {
      const userDataTyped = userData as UserDataModel;
      if (userDataTyped.first !== undefined) {
        setEditFirst(userDataTyped.first);
      }
      if (userDataTyped.last !== undefined) {
        setEditLast(userDataTyped.last);
      }
      if (userDataTyped.number !== undefined) {
        setEditPhone(userDataTyped.number);
      }
      if (userDataTyped.bio !== undefined) {
        setEditBio(userDataTyped.bio);
      }
    }
  }, [userData]);

  const { data: userIm } = useQuery({
    queryKey: user != null ? ["profilepic", user.uid] : ["profilepic"],
    queryFn: async () => {
      if (user != null) {
        return await getUserProfileURL(user.uid);
      } else {
        return null;
      }
    },
  });

  useEffect(() => {
    if (userIm !== undefined && userIm !== null) {
      setImage(userIm);
    }
  }, [userIm]);

  const handeSaveClick = () => {
    const userId = user?.uid;

    const newUserData = userData as UserDataModel;
    newUserData.first = editFirst;
    newUserData.last = editLast;
    newUserData.number = editPhone;
    newUserData.bio = editBio;
    if (image !== "" && image !== undefined && image !== null) {
      newUserData.profilepic = image;
    }
    if (userId === undefined) {
      console.error("Current user undefined");
    } else {
      newUserData.id = userId;
      userMutation.mutate(newUserData);
      router.back();
    }
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

  if (isLoadingUserData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View>
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
      <View>
        <Text style={styles.regtext}>First Name</Text>
        <TextInput
          style={styles.input}
          value={editFirst}
          placeholder={"first name"}
          autoCapitalize="none"
          onChangeText={(text) => {
            setEditFirst(text);
          }}
        />
      </View>
      <View>
        <Text style={styles.regtext}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={editLast}
          placeholder={"last name"}
          autoCapitalize="none"
          onChangeText={(text) => {
            setEditLast(text);
          }}
        />
      </View>
      <View>
        <Text style={styles.regtext}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={editPhone}
          placeholder={"phone number"}
          autoCapitalize="none"
          onChangeText={(text) => {
            setEditPhone(text);
          }}
        />
      </View>
      <View>
        <Text style={styles.regtext}>Bio</Text>
        <TextInput
          style={styles.input}
          value={editBio}
          placeholder={"bio"}
          autoCapitalize="none"
          multiline={true}
          onChangeText={(text) => {
            setEditBio(text);
          }}
        />
      </View>
      <View style={styles.outerButtonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onClose();
            router.back();
          }}
        >
          <Text style={styles.buttonText}>{" Close "}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handeSaveClick}>
          <Text style={styles.buttonText}>{" Save "}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  input: {
    borderColor: "gray",
    width: "100%",
    borderBottomWidth: 1,
    marginBottom: 20,
    marginTop: 10,
    paddingBottom: 5,
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#FB6D0B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    width: "30%",
    alignSelf: "center",
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white", // Ensure text color is white
    fontSize: 16,
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  regtext: {
    marginLeft: 10,
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
    alignSelf: "center",
  },
  defaultImage: {
    height: 100, // Adjust the size of the image as needed
    width: 100, // Adjust the size of the image as needed
    borderRadius: 50, // Make the image circular
  },
  outerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
