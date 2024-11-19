import { Entypo, Feather } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { router, useSegments } from "expo-router";
import React from "react";
import {
  Button,
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BOOKWORM_ORANGE } from "../../constants/constants";

interface SearchBarProps {
  clicked: boolean;
  searchPhrase: string;
  setSearchPhrase: (searchPhrase: string) => void;
  setClicked: (clicked: boolean) => void;
  placeholderText: string | null;
}

const BookSearchBar = ({
  clicked,
  searchPhrase,
  setSearchPhrase,
  setClicked,
  placeholderText,
}: SearchBarProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const segments = useSegments();
  const isRecommendationSearch = segments[2].endsWith("recommendation");

  return (
    <View style={styles.container}>
      <View
        style={
          clicked
            ? styles.searchBar__clicked
            : isRecommendationSearch
              ? styles.searchBar__unclicked
              : styles.searchBar__unclicked__barcode
        }
      >
        {/* search Icon */}
        <Feather
          name="search"
          size={20}
          color="black"
          style={{ marginLeft: 1 }}
        />
        {/* Input field */}
        <TextInput
          style={styles.input}
          placeholder={placeholderText ?? "Search"}
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          onFocus={() => {
            setClicked(true);
          }}
          autoComplete="off"
          autoCorrect={false}
          spellCheck={false}
          textContentType="none"
        />
        {/* cross Icon, depending on whether the search bar is clicked or not */}
        {clicked && (
          <Entypo
            name="cross"
            size={20}
            color="black"
            style={{ padding: 1 }}
            onPress={() => {
              setSearchPhrase("");
            }}
          />
        )}
      </View>
      {/* cancel button, depending on whether the search bar is clicked or not */}
      {clicked && (
        <View>
          <Button
            color={BOOKWORM_ORANGE}
            title="Cancel"
            onPress={() => {
              Keyboard.dismiss();
              setClicked(false);
            }}
          ></Button>
        </View>
      )}
      {!clicked && !isRecommendationSearch && (
        <TouchableOpacity
          onPress={() => {
            if (permission?.granted === false) {
              requestPermission()
                .then((response) => {
                  if (response.granted) {
                    router.push({
                      pathname: "/BarcodeScanner",
                    });
                  }
                })
                .catch((error) => {
                  console.error("Error with camera permissions", error);
                });
            } else {
              router.push({
                pathname: "/BarcodeScanner",
              });
            }
          }}
        >
          <Image
            source={require("../../assets/barcode-icon.png")}
            style={styles.barcode__icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
export default BookSearchBar;

// styles
const styles = StyleSheet.create({
  container: {
    margin: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    width: "90%",
    alignItems: "center",
  },
  searchBar__unclicked: {
    padding: 10,
    flexDirection: "row",
    width: "95%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__unclicked__barcode: {
    padding: 10,
    flexDirection: "row",
    width: "80%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 10,
    flexDirection: "row",
    width: "80%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
  barcode__icon: {
    width: 40,
    height: 33,
  },
});
