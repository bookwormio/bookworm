import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "../../../components/auth/context";
import BookWormButton from "../../../components/button/BookWormButton";
import ProfilePicture from "../../../components/profile/ProfilePicture/ProfilePicture";
import {
  newFetchUserInfo,
  updateUser,
} from "../../../services/firebase-services/UserQueries";
import { emptyQuery } from "../../../services/util/queryUtils";
import { type UserDataModel } from "../../../types";

const EditProfile = () => {
  const { user } = useAuth();
  const [editPhone, setEditPhone] = useState("");
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [save, setSave] = useState("Save");

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
      await queryClient.invalidateQueries({
        queryKey: user != null ? ["profilepic", user.uid] : ["profilepic"],
      });
    },
  });

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
      if (userDataTyped.city !== undefined) {
        setEditCity(userDataTyped.city);
      }
      if (userDataTyped.state !== undefined) {
        setEditState(userDataTyped.state);
      }
    }
  }, [userData]);

  useEffect(() => {
    if (newProfilePic != null) {
      setNewProfilePic(newProfilePic);
    }
  }, [newProfilePic]);

  const handeSaveClick = async () => {
    const userId = user?.uid;

    const newUserData = userData as UserDataModel;
    newUserData.first = editFirst;
    newUserData.last = editLast;
    newUserData.number = editPhone;
    newUserData.bio = editBio;
    newUserData.city = editCity;
    newUserData.state = editState;
    if (newProfilePic !== "" && newProfilePic != null) {
      newUserData.profilepic = newProfilePic;
    }
    if (userId === undefined) {
      console.error("Current user undefined");
    } else {
      newUserData.id = userId;
      // await Promise.all([
      //   userMutation.mutateAsync(newUserData),
      //   refreshMutation.mutateAsync(),
      // ]);
      await userMutation.mutateAsync(newUserData);
      await refreshMutation.mutateAsync();
      router.back();
    }
  };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setNewProfilePic(result.assets[0].uri);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <ProfilePicture
              userID={user?.uid ?? ""}
              size={100}
              newProfilePic={newProfilePic}
            />
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
          <View>
            <Text style={styles.regtext}>City</Text>
            <TextInput
              style={styles.input}
              value={editCity}
              placeholder={"city"}
              autoCapitalize="none"
              onChangeText={(text) => {
                setEditCity(text);
              }}
            />
          </View>
          <View>
            <Text style={styles.regtext}>State</Text>
            <TextInput
              style={styles.input}
              value={editState}
              placeholder={"state"}
              autoCapitalize="none"
              onChangeText={(text) => {
                setEditState(text);
              }}
            />
          </View>
          <View style={styles.outerButtonsContainer}>
            <BookWormButton
              // have to adjust marginHorizontal to make smaller buttons
              title="Close"
              onPress={() => {
                refreshMutation.mutate();
                router.back();
              }}
              style={{ marginHorizontal: 20 }}
            />
            <BookWormButton
              // have to adjust marginHorizontal to make smaller buttons
              title={save}
              onPress={() => {
                setSave("Saving...");
                handeSaveClick()
                  .then(() => {})
                  .catch((error) => {
                    console.error("Error saving profile:", error);
                    setSave("Save");
                  });
              }}
              style={{ marginHorizontal: 20 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  keyAvoidContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 150,
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
    padding: 10,
  },
});
