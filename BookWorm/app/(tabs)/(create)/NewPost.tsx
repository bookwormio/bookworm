import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import { HOURS, MINUTES } from "../../../constants/constants";
import {
  addDataEntry,
  createPost,
} from "../../../services/firebase-services/queries";

const NewPost = () => {
  const { user } = useAuth();
  const [book, setBook] = useState("");
  const [pagesRead, setPagesRead] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [creatingPost, setCreatedPost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
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
        setSelectedHours(0);
        setSelectedMinutes(0);
        setText("");
        setImages([]);
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Post Created",
        });
      });
  };

  const createNewTracking = () => {
    setLoading(true);
    const totalMinutes = 60 * selectedHours + selectedMinutes;
    addDataEntry(user, +pagesRead, totalMinutes)
      .catch((error) => {
        console.error("Error adding tracking. " + error);
      })
      .finally(() => {
        setBook("");
        setSelectedHours(0);
        setSelectedMinutes(0);
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
    const totalMinutes = 60 * selectedHours + selectedMinutes;
    if (book === "") {
      missingFields.push("Book");
    }
    if (totalMinutes === 0) {
      missingFields.push("Time Read");
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

  if (loading) {
    return (
      <View style={styles.container}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="black" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast />
      <TextInput
        style={styles.input}
        value={book}
        placeholder="Book"
        onChangeText={(book) => {
          setBook(book);
        }}
      />
      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <Text style={{ color: "#C7C7CD" }}>Time Read: </Text>
          <RNPickerSelect
            placeholder={{
              label: "0",
              value: "0",
            }}
            items={HOURS}
            value={selectedHours}
            onValueChange={(hoursString: string) => {
              setSelectedHours(+hoursString);
            }}
            style={pickerSelectStyles}
          />
          <Text> hrs </Text>
          <RNPickerSelect
            placeholder={{
              label: "0",
              value: "0",
            }}
            items={MINUTES}
            value={selectedMinutes}
            onValueChange={(minutesString: string) => {
              setSelectedMinutes(+minutesString);
            }}
            style={pickerSelectStyles}
          />
          <Text> mins </Text>
        </View>
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
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
    width: "100%",
    marginTop: 10,
  },
  pagesInput: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: "27%",
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
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center", // Vertically center the items
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "grey",
    height: "100%",
    paddingHorizontal: 10,
    width: "55%",
  },
});

const pickerSelectStyles = StyleSheet.create({
  placeholder: {
    color: "black",
  },
  inputIOS: {
    fontSize: 16,
    width: 30,
    height: 30,
    borderRadius: 5,
    color: "black",
    backgroundColor: "#c9ccd3",
    textAlign: "center",
    marginTop: "10%",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
