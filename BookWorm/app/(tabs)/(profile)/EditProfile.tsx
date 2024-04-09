import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
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
        color="midnightblue"
        onPress={() => {
          onClose();
          router.back();
        }}
      />
      <View>
        <Text>First Name</Text>
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
        <Text>Last Name</Text>
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
        <Text>Phone Number</Text>
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
      <Button title="Save" onPress={handeSaveClick} />
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
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
});
