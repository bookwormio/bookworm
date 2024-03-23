import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const BookViewPage = () => {
  const { bookID } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />
      <Text style={styles.title}>Book id {bookID}</Text>
      <Text style={styles.title}>TEST</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  author: {
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
  },
});

export default BookViewPage;
