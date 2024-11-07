import { StyleSheet } from "react-native";

export const sharedBookshelfStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexGrow: 0,
  },
  listContainer: {
    padding: 20,
    minHeight: 200,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
  },
  length: {
    fontSize: 17,
  },
  list: {
    paddingTop: 0,
  },
  heading: {
    paddingTop: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flatList: {
    flexGrow: 0,
    minHeight: 150,
  },
  emptyShelfText: {
    color: "#666",
    fontStyle: "italic",
  },
  buttonContainer: {
    width: 120,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  subtitle: {
    paddingTop: 3,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
