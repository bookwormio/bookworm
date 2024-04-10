import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  emptyQuery,
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

  const handeSaveClick = () => {
    const userId = user?.uid;

    const newUserData = userData as UserDataModel;
    newUserData.first = editFirst;
    newUserData.last = editLast;
    newUserData.number = editPhone;
    if (userId === undefined) {
      console.error("Current user undefined");
    } else {
      newUserData.id = userId;
      userMutation.mutate(newUserData);
      router.back();
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
      <Button
        title="Close"
        color="black"
        onPress={() => {
          onClose();
          router.back();
        }}
      />
      <View>
        <Text style={styles.regtext}>First Name</Text>
        <TextInput
          style={styles.input}
          value={editFirst}
          placeholder={editFirst === "" ? "first name" : editFirst}
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
          placeholder={editLast === "" ? "last name" : editLast}
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
          placeholder={editPhone === "" ? "phone number" : editPhone}
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
          placeholder={editBio === "" ? "phone number" : editBio}
          autoCapitalize="none"
          multiline={true}
          onChangeText={(text) => {
            setEditBio(text);
          }}
        />
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={handeSaveClick}>
          <Text style={styles.buttonText}>{"Let's Go"}</Text>
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
});
