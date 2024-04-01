import { FontAwesome5 } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import SliderThumb from "../../../components/createpost/SliderThumb";
import {
  addDataEntry,
  createPost,
} from "../../../services/firebase-services/queries";

const NewPost = () => {
  const { user } = useAuth();
  const [book, setBook] = useState("");
  const [minutesRead, setMinutesRead] = useState(0);
  const [pagesRead, setPagesRead] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [creatingPost, setCreatedPost] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

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

  const addPostView = () => {
    setCreatedPost(true);
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        delay: 250,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removePostView = () => {
    setCreatedPost(false);
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        delay: 200,
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setText("");
      setImages([]);
    });
  };

  const createNewPost = () => {
    setLoading(true);
    createPost(user, book, text, images)
      .catch((error) => {
        console.error("Error creating post. " + error);
      })
      .finally(() => {
        removePostView();
        setBook("");
        setMinutesRead(0);
        setText("");
        setImages([]);
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Post Created + Tracking Added",
        });
      });
  };

  const createNewTracking = () => {
    setLoading(true);
    addDataEntry(user, +pagesRead, minutesRead)
      .catch((error) => {
        console.error("Error adding tracking. " + error);
      })
      .finally(() => {
        setBook("");
        setMinutesRead(0);
        setPagesRead("");
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Tracking Added",
          text2: pagesRead + " pages of " + book,
        });
      });
  };

  const fieldsMissing = () => {
    const missingFields: string[] = [];
    if (book === "") {
      missingFields.push("Book");
    }
    if (minutesRead === 0) {
      missingFields.push("Minutes Read");
    }
    if (pagesRead === "") {
      missingFields.push("Pages Read");
    }
    if (creatingPost) {
      if (text === "") {
        missingFields.push("Post Text");
      }
    }
    if (missingFields.length > 0) {
      Toast.show({
        type: "error",
        text1: "Please Complete the Following Fields:",
        text2: missingFields.join(", "),
      });
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <Toast />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      {!loading && (
        <>
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
              renderThumbComponent={() => (
                <SliderThumb minutesRead={minutesRead} />
              )}
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
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 250],
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
                  removePostView();
                } else {
                  if (!fieldsMissing()) {
                    createNewTracking();
                  }
                }
              }}
            />
            <Button
              title={creatingPost ? "Create Post + Tracking" : "Create Post"}
              onPress={() => {
                if (!creatingPost) {
                  addPostView();
                } else {
                  if (!fieldsMissing()) {
                    createNewPost();
                    createNewTracking();
                  }
                }
              }}
            />
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnimation, width: "100%" }}>
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
        </>
      )}
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
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
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
  loading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
  },
});
