import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useUserID } from "../../../components/auth/context";
import BookWormButton from "../../../components/buttons/BookWormButton";
import ProfilePicture from "../../../components/profile/ProfilePicture/ProfilePicture";
import WormLoader from "../../../components/wormloader/WormLoader";
import {
  APP_BACKGROUND_COLOR,
  PROFILE_PLACEHOLDERS,
} from "../../../constants/constants";
import {
  newFetchUserInfo,
  updateUser,
} from "../../../services/firebase-services/UserQueries";

const EditProfile = () => {
  const { userID } = useUserID();
  const [editPhone, setEditPhone] = useState("");
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [save, setSave] = useState("Save");
  const [saveDisabled, setSaveDisabled] = useState(false);

  const queryClient = useQueryClient();

  const userMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["userdata", userID],
      });
    },
  });
  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["userdata", userID],
    queryFn: async () => {
      return await newFetchUserInfo(userID);
    },
  });

  useEffect(() => {
    if (!(userData == null)) {
      setEditFirst(userData.first ?? editFirst);
      setEditLast(userData.last ?? editLast);
      setEditPhone(userData.number ?? editPhone);
      setEditBio(userData.bio ?? editBio);
      setEditCity(userData.city ?? editCity);
      setEditState(userData.state ?? editState);
    }
  }, [userData]);

  useEffect(() => {
    if (newProfilePic != null) {
      setNewProfilePic(newProfilePic);
    }
  }, [newProfilePic]);

  const handeSaveClick = async () => {
    if (userData !== undefined) {
      const newUserData = userData;
      newUserData.first = editFirst;
      newUserData.last = editLast;
      newUserData.number = editPhone;
      newUserData.bio = editBio;
      newUserData.city = editCity;
      newUserData.state = editState;
      if (newProfilePic !== "" && newProfilePic != null) {
        newUserData.profilepic = newProfilePic;
      }
      newUserData.id = userID;
      await userMutation.mutateAsync(newUserData);
      await queryClient.invalidateQueries({
        queryKey: ["profilepic", userID],
      });
      await queryClient.invalidateQueries({
        queryKey: ["userdata", userID],
      });
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
        <WormLoader />
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
              userID={userID}
              size={100}
              overrideProfilePic={newProfilePic}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.regtext}>
              {PROFILE_PLACEHOLDERS.FIRST_NAME}
            </Text>
            <TextInput
              style={styles.input}
              value={editFirst}
              placeholder={PROFILE_PLACEHOLDERS.FIRST_NAME}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setEditFirst(text);
              }}
            />
          </View>
          <View>
            <Text style={styles.regtext}>{PROFILE_PLACEHOLDERS.LAST_NAME}</Text>
            <TextInput
              style={styles.input}
              value={editLast}
              placeholder={PROFILE_PLACEHOLDERS.LAST_NAME}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setEditLast(text);
              }}
            />
          </View>
          <View>
            <Text style={styles.regtext}>{PROFILE_PLACEHOLDERS.PHONE}</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              placeholder={PROFILE_PLACEHOLDERS.PHONE}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              keyboardType="phone-pad"
              onChangeText={(text) => {
                setEditPhone(text);
              }}
            />
          </View>
          <View>
            <Text style={styles.regtext}>{PROFILE_PLACEHOLDERS.BIO}</Text>
            <TextInput
              style={styles.input}
              value={editBio}
              placeholder={PROFILE_PLACEHOLDERS.BIO}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              multiline={true}
              onChangeText={(text) => {
                setEditBio(text);
              }}
            />
          </View>
          <View>
            <Text style={styles.regtext}>{PROFILE_PLACEHOLDERS.CITY}</Text>
            <TextInput
              style={styles.input}
              value={editCity}
              placeholder={PROFILE_PLACEHOLDERS.CITY}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setEditCity(text);
              }}
            />
          </View>
          <View>
            <Text style={styles.regtext}>{PROFILE_PLACEHOLDERS.STATE}</Text>
            <TextInput
              style={styles.input}
              value={editState}
              placeholder={PROFILE_PLACEHOLDERS.STATE}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
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
                router.back();
              }}
              style={{ marginHorizontal: 20 }}
            />
            <BookWormButton
              // have to adjust marginHorizontal to make smaller buttons
              title={save}
              disabled={saveDisabled}
              onPress={() => {
                setSave("Saving...");
                setSaveDisabled(true);
                handeSaveClick()
                  .then(() => {})
                  .catch((error) => {
                    console.error("Error saving profile:", error);
                    setSave("Save");
                    setSaveDisabled(false);
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
    backgroundColor: APP_BACKGROUND_COLOR,
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
    borderRadius: 50,
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
