import { FontAwesome5 } from "@expo/vector-icons";

import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import {
  useBadgeChecking,
  useGetLatestPostInfo,
} from "../../../components/badges/useBadgeQueries";
import BookmarkSlider from "../../../components/bookmark/hooks/BookmarkSlider";
import {
  useGetBookmarkForBook,
  useSetBookmarkForBook,
} from "../../../components/bookmark/hooks/useBookmarkQueries";
import BookDropdownButton from "../../../components/bookselect/BookDropdownButton";
import BookWormButton from "../../../components/button/BookWormButton";
import {
  convertFlatBookToBookShelfBook,
  isBookInCurrentlyReading,
  isBookInFinished,
  isBookInWantToRead,
} from "../../../components/newpost/util/bookShelfUtils";
import {
  prefetchBooksForBookshelves,
  useAddBookToShelf,
  useGetBooksForBookshelves,
  useRemoveBookFromShelf,
} from "../../../components/profile/hooks/useBookshelfQueries";
import WormLoader from "../../../components/wormloader/WormLoader";
import {
  APP_BACKGROUND_COLOR,
  POSTS_ROUTE_PREFIX,
} from "../../../constants/constants";
import { ServerBookShelfName } from "../../../enums/Enums";
import { createPost } from "../../../services/firebase-services/PostQueries";
import { type CreatePostModel } from "../../../types";
import { useNewPostContext } from "./NewPostContext";

const NewPost = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");

  const { selectedBook, setSelectedBook } = useNewPostContext();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [textboxFocused, setTextboxFocused] = useState(false);
  const [shareDisabled, setShareDisabled] = useState(true);

  const { mutate: setBookmark } = useSetBookmarkForBook();
  const postMutation = useMutation({ mutationFn: createPost });

  const addBookMutation = useAddBookToShelf();
  const removeBookMutation = useRemoveBookFromShelf();

  const {
    data: oldBookmark,
    isLoading: bookmarkLoading,
    isSuccess: isBookmarkLoadedSuccess,
  } = useGetBookmarkForBook(user?.uid, selectedBook?.id);

  void prefetchBooksForBookshelves(user?.uid ?? "");

  const { data: bookshelves } = useGetBooksForBookshelves(user?.uid ?? "");

  const [currentBookmark, setCurrentBookmark] = useState(0);

  useEffect(() => {
    setCurrentBookmark(isBookmarkLoadedSuccess ? oldBookmark ?? 0 : 0);
  }, [isBookmarkLoadedSuccess, oldBookmark, selectedBook]);

  useEffect(() => {
    if (selectedBook != null && text !== "") {
      setShareDisabled(false);
    }
  }, [selectedBook, text]);

  const createNewPost = async () => {
    if (user != null) {
      setLoading(true);
      const post: CreatePostModel = {
        userid: user.uid,
        // TS requires null checks here but they get checked in fieldsMissing
        bookid: selectedBook !== null ? selectedBook.id : "",
        booktitle: selectedBook !== null ? selectedBook.title : "",
        text,
        images:
          // Append book image to the images array if it exists
          selectedBook?.image != null
            ? [selectedBook.image, ...images]
            : images,
        oldBookmark,
        newBookmark: currentBookmark,
        totalPages: selectedBook?.pageCount ?? 0,
      };
      postMutation.mutate(post);
      resetForm();
      Toast.show({
        type: "success",
        text1: "Post Created",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Current user is undefined",
      });
    }
  };

  const resetForm = () => {
    setSelectedBook(null);
    setText("");
    setImages([]);
    setCurrentBookmark(0);
    setLoading(false);
  };

  const fieldsMissing = () => {
    const missingFields: string[] = [];
    if (selectedBook?.id == null) {
      missingFields.push("Book");
    }
    if (text === "") {
      missingFields.push("Post Text");
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

  const handleShareClicked = async () => {
    if (user?.uid == null || selectedBook == null) return;
    if (!fieldsMissing()) {
      await createNewPost();
      setBookmark({
        userID: user?.uid,
        bookID: selectedBook?.id,
        bookmark: currentBookmark,
        oldBookmark,
      });
      if (bookshelves == null) {
        return;
      }
      if (currentBookmark === selectedBook.pageCount) {
        if (!isBookInFinished(selectedBook.id, bookshelves)) {
          await addBookMutation.mutateAsync({
            userID: user.uid,
            bookID: selectedBook.id,
            volumeInfo: convertFlatBookToBookShelfBook(selectedBook),
            shelfName: ServerBookShelfName.FINISHED,
          });
        }
        if (isBookInCurrentlyReading(selectedBook.id, bookshelves)) {
          await removeBookMutation.mutateAsync({
            userID: user.uid,
            bookID: selectedBook.id,
            shelfName: ServerBookShelfName.CURRENTLY_READING,
          });
        }
      }
      // if currentBookmark does not equal page count
      else {
        if (!isBookInCurrentlyReading(selectedBook.id, bookshelves)) {
          await addBookMutation.mutateAsync({
            userID: user.uid,
            bookID: selectedBook.id,
            volumeInfo: convertFlatBookToBookShelfBook(selectedBook),
            shelfName: ServerBookShelfName.CURRENTLY_READING,
          });
        }
      }
      if (isBookInWantToRead(selectedBook.id, bookshelves)) {
        await removeBookMutation.mutateAsync({
          userID: user.uid,
          bookID: selectedBook.id,
          shelfName: ServerBookShelfName.WANT_TO_READ,
        });
      }
      const post = await useGetLatestPostInfo(user?.uid);
      await useBadgeChecking(user?.uid, post?.id).then(() => {
        router.push(POSTS_ROUTE_PREFIX);
      });
    }
  };

  const removeImageByIndex = (indexToRemove: number) => {
    setImages((images) => images.filter((_, index) => index !== indexToRemove));
  };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages((oldArray) => [...oldArray, result.assets[0].uri]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {loading && (
          <View style={styles.loading}>
            <WormLoader />
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BookDropdownButton selectedBook={selectedBook} />

      {selectedBook?.pageCount != null &&
        selectedBook.pageCount > 0 &&
        !bookmarkLoading && (
          <BookmarkSlider
            oldBookmark={oldBookmark ?? 0}
            currentBookmark={currentBookmark}
            setCurrentBookmark={setCurrentBookmark}
            pageCount={selectedBook.pageCount}
          ></BookmarkSlider>
        )}

      <View style={styles.textInputWrapper}>
        <View
          style={[
            styles.textInputDivider,
            textboxFocused && styles.textInputDividerFocused,
          ]}
        />
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInputField}
            multiline={true}
            value={text}
            placeholder="What's on your mind..."
            placeholderTextColor="#888888"
            onChangeText={(text) => {
              setText(text);
            }}
            onFocus={() => {
              setTextboxFocused(true);
            }}
            onBlur={() => {
              setTextboxFocused(false);
            }}
          />
        </View>
        <View
          style={[
            styles.textInputDivider,
            textboxFocused && styles.textInputDividerFocused,
          ]}
        />
      </View>
      <ScrollView
        horizontal={true}
        style={styles.imageScroll}
        showsHorizontalScrollIndicator={false}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
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
          style={styles.addImageButton}
          onPress={() => {
            pickImageAsync().catch((error) => {
              Toast.show({
                type: "error",
                text1: "Error selecting image: " + error,
                text2: "Please adjust your media permissions",
              });
            });
          }}
        >
          <FontAwesome5 name="plus" size={24} color="#555555" />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <BookWormButton
          title="Share!"
          onPress={() => {
            handleShareClicked().catch((error) => {
              console.log(error);
            });
          }}
          disabled={shareDisabled}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: APP_BACKGROUND_COLOR,
    flexGrow: 1,
    flexDirection: "column",
  },
  slider: {
    marginBottom: 20,
  },
  inputContainer: {
    borderRadius: 15,
    marginBottom: 20,
  },
  input: {
    padding: 15,
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
  },
  imageScroll: {
    flexGrow: 0,
    marginBottom: 145,
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addImageButton: {
    height: 200,
    width: 200,
    backgroundColor: "#DDDDDD",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    paddingBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "rgba(251, 109, 11, 0.5)", // 50% opacity of original color
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.7)", // 70% opacity white
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
  },
  textInputWrapper: {
    marginVertical: 15,
  },
  textInputContainer: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  textInputField: {
    color: "#333333",
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  textInputDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
  },
  textInputDividerFocused: {
    backgroundColor: "#000000",
  },
});

export default NewPost;
