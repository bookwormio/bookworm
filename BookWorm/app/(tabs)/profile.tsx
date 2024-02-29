import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../components/auth/context";
import {
  fetchFirstName,
  fetchLastName,
  fetchPhoneNumber,
  updateUserInfo,
} from "../../services/firebase-services/queries";

export default function Profile() {
  const { signOut, user } = useAuth();
  const userStr: string = user?.email ?? "No email";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

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
          setIsModalVisible(true);
        }}
      />
      <Modal
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
        animationType="slide"
      >
        <Button
          title="Close"
          color="midnightblue"
          onPress={() => {
            setIsModalVisible(false);
          }}
        />
        <View>
          <Text>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            placeholder={firstName === "" ? "first name" : firstName}
            autoCapitalize="none"
            onChangeText={(text) => {
              setFirstName(text);
            }}
          />
        </View>
        <View>
          <Text>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            placeholder={lastName === "" ? "last name" : lastName}
            autoCapitalize="none"
            onChangeText={(text) => {
              setLastName(text);
            }}
          />
        </View>
        <View>
          <Text>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            placeholder={phoneNumber === "" ? "phone number" : phoneNumber}
            autoCapitalize="none"
            onChangeText={(text) => {
              setPhoneNumber(text);
            }}
          />
        </View>
        <Button
          title="Save"
          onPress={() => {
            if (user != null) {
              updateUserInfo(user, firstName, lastName, phoneNumber)
                .then(() => {
                  setIsModalVisible(false);
                  router.replace("/profile");
                })
                .catch((error) => {
                  console.error("Error updating user info:", error);
                  // Handle error here, e.g., show error message
                });
            } else {
              alert("Error: user DNE");
            }
          }}
        />
      </Modal>
    </View>
  );
}

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
