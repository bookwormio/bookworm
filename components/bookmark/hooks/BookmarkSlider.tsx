import { FontAwesome5 } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BOOKWORM_ORANGE } from "../../../constants/constants";

interface BookmarkSliderProps {
  oldBookmark: number | null;
  currentBookmark: number;
  setCurrentBookmark: (bookmark: number) => void;
  pageCount: number;
}

const BookmarkSlider = ({
  oldBookmark,
  currentBookmark,
  setCurrentBookmark,
  pageCount,
}: BookmarkSliderProps) => {
  return (
    <View style={styles.bookmarkContainer}>
      <Text style={styles.title}>Bookmark</Text>
      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.undoButton}
          onPress={() => {
            setCurrentBookmark(oldBookmark ?? 0);
          }}
          disabled={oldBookmark === currentBookmark}
        >
          <FontAwesome5
            name="undo"
            size={20}
            color={oldBookmark === currentBookmark ? "#BDBDBD" : "black"}
          />
        </TouchableOpacity>
        <View style={styles.outerSliderContainer}>
          <Slider
            containerStyle={styles.sliderContainer}
            value={[currentBookmark]}
            onValueChange={(value: number[]) => {
              setCurrentBookmark(value[0]);
            }}
            minimumValue={0}
            maximumValue={pageCount}
            renderThumbComponent={() => (
              <BookmarkSliderThumb currentBookmark={currentBookmark} />
            )}
            step={1}
            minimumTrackTintColor={BOOKWORM_ORANGE}
          />
        </View>
      </View>
    </View>
  );
};
export default BookmarkSlider;

interface BookmarkSliderThumbProps {
  currentBookmark: number;
}

const BookmarkSliderThumb = ({ currentBookmark }: BookmarkSliderThumbProps) => {
  return (
    <View style={styles.sliderThumbContainer}>
      <Text>{currentBookmark}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bookmarkContainer: {
    marginBottom: 20,
  },
  sliderThumbContainer: {
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: "grey",
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  undoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  outerSliderContainer: {
    flexGrow: 1,
  },
  sliderContainer: {
    width: "100%",
    height: 20,
    alignSelf: "flex-start",
    paddingVertical: 30,
  },
});
