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
  fetchUserData,
  updateUserInfo,
} from "../../../services/firebase-services/queries";

const EditProfile = () => {
  const { user } = useAuth();
  const [editPhone, setEditPhone] = useState("");
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");

  const queryClient = useQueryClient();
  const { mutateAsync: updateUserQuery } = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userdata"] });
    },
  });
  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: user != null ? ["userdata", user.uid] : ["userdata"],
    queryFn: async () => {
      if (user != null) {
        return await fetchUserData(user);
      } else {
        // Return default value when user is null
        return {};
      }
    },
  });

  if (userData !== undefined) console.log(" wow ", userData);

  useEffect(() => {
    if (userData !== undefined) {
      const userDataTyped = userData as UserData;
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

  if (isLoadingUserData) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View>
      <Button
        title="Close"
        color="midnightblue"
        onPress={() => {
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
      <Button
        title="Save"
        onPress={async () => {
          await updateUserQuery(userData).then(() => {
            router.back();
          });
        }}
      />
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
});
