import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { getAllFRNotifications } from "../../../services/firebase-services/NotificationQueries";

const NotificationsScreen = () => {
  const handlePress = () => {
    alert("Hello World! This is a notification.");
  };

  const { user } = useAuth();

  const { data: notifdata, isLoading: notifIsLoading } = useQuery({
    queryKey: user != null ? ["notifications", user.uid] : ["notifications"],
    queryFn: async () => {
      if (user != null) {
        return await getAllFRNotifications(user.uid);
      } else {
        return [];
      }
    },
  });

  if (!notifIsLoading) {
    // console.log(notifdata);
    if (notifdata !== null && notifdata !== undefined) {
      console.log("here");
      console.log(notifdata[0].created);
      const date: Date = notifdata[0].created.toDate();
      console.log(date);
      const not = notifdata;
      console.log(not[0]);
      return (
        <View style={styles.container}>
          <FlatList
            style={{ flex: 1 }}
            data={notifdata}
            renderItem={({ item }) => {
              const createdDate: Date = item.created.toDate();
              const formattedDate = createdDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });
              return (
                <View>
                  <Text>
                    {item.sender} {item.message} on {formattedDate}
                  </Text>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      );
    } else {
      console.log("something wrong");
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Notifications Page</Text>
          <Button title="Show Alert" onPress={handlePress} />
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default NotificationsScreen;
