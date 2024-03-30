import { FontAwesome5 } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  Animated,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import SliderThumb from "../../../components/createpost/SliderThumb";

const NewPost = () => {
  const { user } = useAuth();
  const [book, setBook] = useState("");
  const [minutesRead, setMinutesRead] = useState(0);
  const [pagesRead, setPagesRead] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [creatingPost, setCreatedPost] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages((oldArray) => [...oldArray, result.assets[0].uri]);
    }
  };

  const removeImageByIndex = (indexToRemove: number) => {
    setImages((images) => images.filter((_, index) => index !== indexToRemove));
  };

  const onPostButtonPress = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: 250,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    setCreatedPost(true);
  };

  const onRemovePostButtonPress = () => {
    setCreatedPost(false);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
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
      <View style={styles.rowContainer}>
        <Slider
          containerStyle={styles.sliderContainer}
          value={minutesRead}
          onValueChange={(value) => {
            setMinutesRead(value[0]);
          }}
          minimumValue={0}
          maximumValue={240}
          renderThumbComponent={() => <SliderThumb minutesRead={minutesRead} />}
          step={5}
        />
        <TextInput
          style={styles.pagesInput}
          value={pagesRead}
          keyboardType="numeric"
          placeholder="Pages Read"
          onChangeText={(pages) => {
            setPagesRead(pages);
          }}
        />
      </View>

      <Animated.View
        style={[
          styles.rowContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 400],
                }),
              },
            ],
          },
        ]}
      >
        <Button
          title={creatingPost ? "Remove Post" : "Add Tracking"}
          onPress={() => {
            if (creatingPost) {
              onRemovePostButtonPress();
            }
          }}
        />
        <Button
          title={creatingPost ? "Create Post + Tracking" : "Create Post"}
          onPress={onPostButtonPress}
        />
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
        <TextInput
          style={[styles.input, { height: "25%" }]}
          multiline={true}
          value={text}
          placeholder="Add some text to your post"
          onChangeText={(text) => {
            setText(text);
          }}
        />
        <ScrollView horizontal={true} style={{ marginTop: 20 }}>
          {images.map((image: string, index: number) => (
            <View key={index}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  removeImageByIndex(index);
                }}
              >
                <FontAwesome5 name="times-circle" size={20} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.defaultImage}
            onPress={() => {
              pickImageAsync().catch((error) => {
                console.error("Error selecting image. " + error);
              });
            }}
          >
            <FontAwesome5 name="image" size={20} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sliderContainer: {
    width: "70%",
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically in the center
    justifyContent: "space-between",
  },
  pagesInput: {
    borderColor: "gray",
    width: "27%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginLeft: "3%",
  },
  defaultImage: {
    backgroundColor: "#d3d3d3",
    height: 100,
    width: 100,
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 100,
    width: 100,
    borderColor: "black",
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 7,
    backgroundColor: "white",
    borderRadius: 50,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
