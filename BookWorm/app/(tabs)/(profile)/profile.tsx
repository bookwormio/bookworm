import { useQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import { fetchUserData } from "../../../services/firebase-services/queries";
import { type UserDataModel } from "../../../types";

const Profile = () => {
  // const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const userStr: string = user?.email ?? "No email";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const navigation = useNavigation();

  const { data: userData, isLoading: isLoadingUserData } = useQuery({
    queryKey: user != null ? ["userdata", user.uid] : ["userdata"],
    queryFn: async () => {
      if (user != null) {
        const userdata = await fetchUserData(user);
        setProfileLoading(false);
        return userdata;
      } else {
        // Return default value when user is null
        return {};
      }
    },
  });

  useEffect(() => {
    if (userData !== undefined && userData != null) {
      const userDataTyped = userData as UserDataModel;
      if (userDataTyped.first !== undefined) {
        setFirstName(userDataTyped.first);
      }
      if (userDataTyped.last !== undefined) {
        setLastName(userDataTyped.last);
      }
    } else if (userData == null) {
      signOut();
    }
  }, [userData]);

  useEffect(() => {
    setProfileLoading(true);
  }, [navigation]);

  if (isLoadingUserData || profileLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text>Current User email: {userStr}</Text>
      <Text>
        Current User Name: {firstName} {lastName}
      </Text>
      <Button title="LogOut" onPress={signOut} />
      <Button
        title="Edit Profile"
        onPress={() => {
          if (user != null) {
            router.push({
              pathname: "EditProfile",
            });
          } else {
            console.error("User DNE");
          }
          setProfileLoading(true);
        }}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
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
