import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import { fetchUserData } from "../../../services/firebase-services/queries";
import { type UserDataModel } from "../../../types";

const Profile = () => {
  // const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
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
      if (userDataTyped.bio !== undefined) {
        setBio(userDataTyped.bio);
      }
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
    <View>
      <View style={styles.imageTextContainer}>
        <TouchableOpacity style={styles.defaultImageContainer}>
          <FontAwesome5 name="user" size={30} />
        </TouchableOpacity>
        <View>
          <Text style={styles.nameText}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.locText}>Salt Lake City, UT</Text>
        </View>
      </View>
      <View>
        <Text style={styles.bioPad}>{bio}</Text>
      </View>
      <View style={styles.imageTextContainer}>
        <View style={styles.locText}>
          <Text>Following</Text>
          <Text>0</Text>
        </View>
        <View style={styles.locText}>
          <Text>Followers</Text>
          <Text>0</Text>
        </View>
      </View>
      <Button title="LogOut" onPress={signOut} color="black" />
      <Button
        color="black"
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
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
    marginTop: 20,
  },
  bioPad: {
    paddingLeft: 40,
  },
  nameText: {
    paddingLeft: 20,
    fontSize: 30,
    marginTop: -10,
  },
  locText: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  defaultImageContainer: {
    backgroundColor: "#d3d3d3",
    height: 60,
    width: 60,
    borderColor: "black",
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  buttoncontainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 160,
    width: "100%",
  },
  button: {
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "orange",
  },
  buttonText: {
    color: "orange",
  },
  backButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    padding: 10,
  },
  buttonwrapper: {
    marginBottom: 8,
    alignItems: "flex-start",
  },
});
