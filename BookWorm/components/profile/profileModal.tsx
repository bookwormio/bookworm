import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [modalPhone, setModalPhone] = useState("");
  const [modalFirst, setModalFirst] = useState("");
  const [modalLast, setModalLast] = useState("");

  useEffect(() => {
    setModalPhone(phoneNumber);
    setModalFirst(firstName);
    setModalLast(lastName);
  }, [isModalVisible]);

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
          setModalFirst(firstName);
          setModalLast(lastName);
          setModalPhone(phoneNumber);
          setIsModalVisible(false);
        }}
      />
      <View>
        <Text>First Name</Text>
        <TextInput
          style={styles.input}
          value={modalFirst}
          placeholder={modalFirst === "" ? "first name" : modalFirst}
          autoCapitalize="none"
          onChangeText={(text) => {
            setModalFirst(text);
          }}
        />
      </View>
      <View>
        <Text>Last Name</Text>
        <TextInput
          style={styles.input}
          value={modalLast}
          placeholder={modalLast === "" ? "last name" : modalLast}
          autoCapitalize="none"
          onChangeText={(text) => {
            setModalLast(text);
          }}
        />
      </View>
      <View>
        <Text>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={modalPhone}
          placeholder={modalPhone === "" ? "phone number" : modalPhone}
          autoCapitalize="none"
          onChangeText={(text) => {
            setModalPhone(text);
          }}
        />
      </View>
      <Button
        title="Save"
        onPress={() => {
          if (user != null) {
            setFirstName(modalFirst);
            setLastName(modalLast);
            setPhoneNumber(modalPhone);
            updateUserInfo(user, modalFirst, modalLast, modalPhone)
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
