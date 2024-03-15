import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import {
  fetchFirstName,
  fetchLastName,
  fetchPhoneNumber,
} from "../../../services/firebase-services/queries";

const Profile = () => {
  const { signOut, user } = useAuth();
  const userStr: string = user?.email ?? "No email";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // if user logs in, this useEffect populates user profile info
  useEffect(() => {
    async function fetchData() {
      try {
        if (user != null) {
          const firstName = await fetchFirstName(user);
          const lastName = await fetchLastName(user);
          const phoneNumber = await fetchPhoneNumber(user);

          setFirstName(firstName);
          setLastName(lastName);
          setPhoneNumber(phoneNumber);
        } else {
          alert("user DNE");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData().catch((error) => {
      console.error("Error fetching first name:", error);
    });
  }, []);

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
          router.push("EditProfile");
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
