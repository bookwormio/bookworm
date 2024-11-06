import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  bookShelfDisplayMap,
  bookShelfSubtitle,
  BORROWING_SHELF_NAME,
} from "../../../enums/Enums";
import { type BookShelfBookModel } from "../../../types";
import BookShelfBook from "./BookShelfBook";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BorrowingBookShelfProps {
  books: BookShelfBookModel[];
  userID: string;
}

const BorrowingBookShelf = ({ books, userID }: BorrowingBookShelfProps) => {
  const shelfNameDisplay = bookShelfDisplayMap[BORROWING_SHELF_NAME];
  const shelfSubtitle = bookShelfSubtitle[BORROWING_SHELF_NAME];

  return (
    <View style={sharedBookshelfStyles.list}>
      <View style={sharedBookshelfStyles.heading}>
        <View>
          <Text style={sharedBookshelfStyles.title}>{shelfNameDisplay}</Text>
          <Text style={sharedBookshelfStyles.subtitle}>{shelfSubtitle}</Text>
        </View>
        <Text style={sharedBookshelfStyles.length}>{books.length}</Text>
      </View>
      <FlatList
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sharedBookshelfStyles.listContainer}
        style={sharedBookshelfStyles.flatList}
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity>
              {item.volumeInfo != null && (
                <BookShelfBook book={item.volumeInfo} bookID={item.id} />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={sharedBookshelfStyles.emptyShelfText}>
            {"You aren't borrowing any books"}
          </Text>
        )}
      />
      <Toast />
    </View>
  );
};

export default BorrowingBookShelf;

// TODO share styles with BookShelf
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "100%",
//     flexGrow: 0,
//   },
//   listContainer: {
//     padding: 20,
//     minHeight: 200,
//   },
//   title: {
//     fontSize: 17,
//     fontWeight: "bold",
//   },
//   length: {
//     fontSize: 17,
//   },
//   list: {
//     paddingTop: 0,
//   },
//   heading: {
//     paddingTop: 20,
//     paddingHorizontal: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   flatList: {
//     flexGrow: 0,
//     minHeight: 150,
//   },
//   emptyShelfText: {
//     color: "#666",
//     fontStyle: "italic",
//   },
//   buttonContainer: {
//     width: 120,
//     marginRight: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     height: 50,
//   },
//   subtitle: {
//     paddingTop: 3,
//     fontSize: 14,
//     color: "#666",
//     fontStyle: "italic",
//   },
// });
