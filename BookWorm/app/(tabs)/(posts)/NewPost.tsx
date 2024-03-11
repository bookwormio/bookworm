import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button, Image, StyleSheet, TextInput, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { createPost } from "../../../services/firebase-services/queries";

export default function NewPost() {
  const { user } = useAuth();
  const [book, setBook] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={book}
        placeholder="Book"
        onChangeText={(book) => {
          setBook(book);
        }}
      />
      <TextInput
        style={styles.input}
        value={text}
        placeholder="Some post text"
        onChangeText={(text) => {
          setText(text);
        }}
      />
      <Button
        title="Choose a photo"
        onPress={() => {
          pickImageAsync().catch((error) => {
            console.log(error);
          });
        }}
      />
      <Button
        title="Take a photo"
        onPress={() => {
          router.push("CameraView");
        }}
      />
      {image !== "" && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
      <Button
        title="Create Post"
        onPress={() => {
          createPost(user, book, text, image)
            .then(() => {
              router.back();
            })
            .catch((error) => {
              console.log(error);
            });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 40,
    justifyContent: "center",
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
