import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
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
import { type UserData } from "../../../types";

const Profile = () => {
  // const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const userStr: string = user?.email ?? "No email";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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

  useEffect(() => {
    if (userData !== undefined) {
      const userDataTyped = userData as UserData;
      if (userDataTyped.first !== undefined) {
        setFirstName(userDataTyped.first);
      }
      if (userDataTyped.last !== undefined) {
        setLastName(userDataTyped.last);
      }
    }
  }, [userData]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("state", (event) => {
  //     const { data } = event;
  //     if (
  //       data.state.routeNames[data.state.routeNames.length - 1] ===
  //         "EditProfile" &&
  //       data.state.index === 0
  //     ) {
  //       setPageRefresh((pageRefresh) => !pageRefresh);
  //     }
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  if (isLoadingUserData) {
    return <ActivityIndicator size="large" color="#000000" />;
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
});
