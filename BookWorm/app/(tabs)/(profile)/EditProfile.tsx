import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { updateUserInfo } from "../../../services/firebase-services/queries";

const EditProfile = () => {
  const { user } = useAuth();
  const { phoneNumber, firstName, lastName } = useLocalSearchParams();
  const [editPhone, setEditPhone] = useState<string>(
    Array.isArray(phoneNumber) ? phoneNumber[0] ?? "" : phoneNumber ?? "",
  );
  const [editFirst, setEditFirst] = useState<string>(
    Array.isArray(firstName) ? firstName[0] ?? "" : firstName ?? "",
  );
  const [editLast, setEditLast] = useState<string>(
    Array.isArray(lastName) ? lastName[0] ?? "" : lastName ?? "",
  );

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
        onPress={() => {
          if (user != null) {
            updateUserInfo(user, editFirst, editLast, editPhone)
              .then(() => {
                router.back();
              })
              .catch((error) => {
                console.error("Error updating user info:", error);
                // Handle error here, e.g., show error message
              });
          } else {
            console.error("User DNE");
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
