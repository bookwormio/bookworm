import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  fetchUserData,
  getNumberOfFollowersByUserID,
  getNumberOfFollowingByUserID,
  getUserProfileURL,
} from "../../../services/firebase-services/queries";
import { type UserDataModel } from "../../../types";

const Profile = () => {
  // const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
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

  const { data: userIm, isLoading: isLoadingIm } = useQuery({
    queryKey: user != null ? ["profilepic", user.uid] : ["profilepic"],
    queryFn: async () => {
      if (user != null) {
        return await getUserProfileURL(user.uid);
      } else {
        return null;
      }
    },
  });

  const { data: followersCount } = useQuery({
    queryKey: user != null ? ["followersdata", user.uid] : ["followersdata"],
    queryFn: async () => {
      if (user != null) {
        const followers = await getNumberOfFollowersByUserID(user.uid);
        return followers ?? 0;
      } else {
        return 0;
      }
    },
  });

  const { data: followingCount } = useQuery({
    queryKey: user != null ? ["followingdata", user.uid] : ["followingdata"],
    queryFn: async () => {
      if (user != null) {
        const following = await getNumberOfFollowingByUserID(user.uid);
        return following ?? 0;
      } else {
        return 0;
      }
    },
  });

  useEffect(() => {
    if (userIm !== undefined && userIm !== null) {
      setImage(userIm);
    }
  }, [userIm]);

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

  if (isLoadingUserData || profileLoading || isLoadingIm) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.imageTextContainer}>
        <View style={styles.defaultImageContainer}>
          {
            // TODO: use a default profile pic
            image !== "" ? (
              <Image style={styles.defaultImage} source={{ uri: image }} />
            ) : (
              <FontAwesome5 name="user" size={40} />
            )
          }
        </View>
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
          <Text>Followers</Text>
          <Text>{followersCount ?? "-"}</Text>
        </View>
        <View style={styles.locText}>
          <Text>Following</Text>
          <Text>{followingCount ?? "-"}</Text>
        </View>
      </View>
      <View style={styles.outerButtonsContainer}>
        <TouchableOpacity
          style={styles.button}
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
        >
          <Text style={styles.buttonText}>{"Edit Profile"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>{"Log Out"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.outerButtonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (user != null) {
              router.push({ pathname: "AddData" });
            } else {
              console.error("User DNE");
            }
          }}
        >
          <Text style={styles.buttonText}>{"Add Entry"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (user != null) {
              router.push({ pathname: "ViewData" });
            } else {
              console.error("User DNE");
            }
          }}
        >
          <Text style={styles.buttonText}>{"View Data"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  outerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  button: {
    backgroundColor: "#FB6D0B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    paddingRight: 40,
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
  defaultImage: {
    height: 60, // Adjust the size of the image as needed
    width: 60, // Adjust the size of the image as needed
    borderRadius: 50, // Make the image circular
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    borderRadius: 100, // Make it circular for profile picture
  },
});
