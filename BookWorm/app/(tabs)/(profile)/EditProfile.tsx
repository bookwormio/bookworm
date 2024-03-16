import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { updateUserInfo } from "../../../services/firebase-services/queries";

const EditProfile = () => {
  const { user } = useAuth();
  const { phoneNumber, firstName, lastName } = useLocalSearchParams();
  const [modalPhone, setModalPhone] = useState<string>(
    Array.isArray(phoneNumber) ? phoneNumber[0] ?? "" : phoneNumber ?? "",
  );
  const [modalFirst, setModalFirst] = useState<string>(
    Array.isArray(firstName) ? firstName[0] ?? "" : firstName ?? "",
  );
  const [modalLast, setModalLast] = useState<string>(
    Array.isArray(lastName) ? lastName[0] ?? "" : lastName ?? "",
  );

  console.log(`modal phone number: ${modalPhone}`);
  console.log(`modal first name: ${modalFirst}`);
  console.log(`modal last name: ${modalLast}`);
  console.log(`phone number: ${modalPhone}`);
  console.log(`first name: ${modalFirst}`);
  console.log(`last name: ${modalLast}`);
  console.log(`user: ${user.uid}`);

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
            updateUserInfo(user, modalFirst, modalLast, modalPhone)
              .then(() => {
                router.back();
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
