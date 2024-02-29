import { router } from "expo-router";
import React from "react";
import { Button, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { updateUserInfo } from "../../services/firebase-services/queries";

export default function EditProfileModal({
  isModalVisible,
  setIsModalVisible,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phoneNumber,
  setPhoneNumber,
  user,
}) {
  return (
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
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
