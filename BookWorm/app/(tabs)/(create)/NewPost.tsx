import { Slider } from "@miblanchard/react-native-slider";
import { type SliderOnChangeCallback } from "@miblanchard/react-native-slider/lib/types";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button, Image, StyleSheet, TextInput, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import SliderThumb from "../../../components/createpost/SliderThumb";
import { createPost } from "../../../services/firebase-services/queries";

const NewPost = () => {
  const { user } = useAuth();
  const [book, setBook] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [minutesRead, setMinutesRead] = useState(0);

  // weird slider onChange notation
  const onSliderChange: SliderOnChangeCallback = (value: number[]) => {
    setMinutesRead(value[0]);
  };

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
      <Slider
        containerStyle={styles.sliderContainer}
        value={minutesRead}
        onValueChange={onSliderChange}
        minimumValue={0}
        maximumValue={180}
        renderThumbComponent={() => <SliderThumb minutesRead={minutesRead} />}
        step={1}
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
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    justifyContent: "center",
  },
  sliderContainer: {
    width: "85%",
    height: 20,
    alignSelf: "flex-start",
    paddingVertical: 30,
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
