import { router } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { addDataEntry } from "../../../services/firebase-services/queries";

const AddData = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState<string>("");

  const handleAddEntry = () => {
    const currentDate = new Date();
    try {
      const pagesInt = parseInt(pages);
      if (user != null) {
        addDataEntry(user, currentDate, pagesInt)
          .then(() => {
            router.back();
          })
          .catch((error) => {
            console.error("Error adding entry:", error);
          });
      }
    } catch {
      console.error("Entry could not be added");
    }
  };
  return (
    <View>
      <Button
        title="Close"
        color="midnightblue"
        onPress={() => {
          router.back();
        }}
      />
      <Text>Enter Pages:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pages"
        keyboardType="numeric"
        onChangeText={(text) => {
          setPages(text.replace(/[^0-9]/g, ""));
        }}
        value={pages}
      />
      <Button
        title="Save"
        onPress={() => {
          if (user != null) {
            handleAddEntry();
          } else {
            console.error("User DNE");
          }
        }}
      />
    </View>
  );
};

export default AddData;

const styles = StyleSheet.create({
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
