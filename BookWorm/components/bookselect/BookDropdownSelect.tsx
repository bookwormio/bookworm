import AntDesign from "@expo/vector-icons/AntDesign";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { fetchBooksByTitleSearch } from "../../services/firebase-services/queries";
import { type FlatBookItemModel } from "../../types";

// Stateful vars passed in by parent component
interface BookDropdownSelectProps {
  selectedBook: FlatBookItemModel | null;
  setSelectedBook: React.Dispatch<
    React.SetStateAction<FlatBookItemModel | null>
  >;
  searchPhrase: string;
  setSearchPhrase: React.Dispatch<React.SetStateAction<string>>;
}

const BookDropdownSelect = ({
  selectedBook,
  setSelectedBook,
  searchPhrase,
  setSearchPhrase,
}: BookDropdownSelectProps) => {
  const { data: books } = useQuery({
    queryKey: ["searchbooks", searchPhrase],
    queryFn: async () => {
      if (searchPhrase.trim() === "") {
        return [];
      }
      return await fetchBooksByTitleSearch(searchPhrase);
    },
    // map books to flattened format
    select: (data) =>
      data === null || data === undefined
        ? []
        : data.map((book) => ({
            id: book.id,
            title: book.volumeInfo?.title,
            image: book.volumeInfo?.imageLinks?.smallThumbnail,
          })),
    staleTime: 60000, // Set stale time to 1 minute
  });

  const renderItem = (item: FlatBookItemModel) => {
    return (
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item?.image }}
            defaultSource={require("../../assets/default_book.png")}
            style={styles.image}
          />
        </View>
        <Text style={styles.textItem}>{item.title}</Text>
        {item.id === selectedBook?.id && (
          <AntDesign
            // TODO: Fix this selected icon
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
      </View>
    );
  };

  const handleSelect = (item: FlatBookItemModel) => {
    setSelectedBook(item); // Save the selected book item
  };

  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={books ?? []} // Default to empty array if books is undefined
      search
      maxHeight={300}
      labelField="title"
      valueField="id"
      searchField="title"
      placeholder={selectedBook != null ? selectedBook.title : "Select a book"}
      searchPlaceholder="Search books..."
      value={selectedBook != null ? selectedBook.id : null}
      onChangeText={setSearchPhrase}
      onChange={handleSelect}
      renderLeftIcon={() => (
        <AntDesign name="book" size={20} color="black" style={styles.icon} />
      )}
      renderItem={renderItem}
    />
  );
};

export default BookDropdownSelect;

const styles = StyleSheet.create({
  dropdown: {
    width: "100%",
    margin: 16,
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  imageContainer: {
    marginRight: 10, // Add some spacing between image and text
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
