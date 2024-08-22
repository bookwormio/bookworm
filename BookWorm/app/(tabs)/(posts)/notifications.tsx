import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { getAllFRNotifications } from "../../../services/firebase-services/NotificationQueries";
import { type FRNotification } from "../../../types";

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

  interface ItemProps {
    title: string;
  }

  const Item = ({ title }: ItemProps) => (
    <View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  if (!notifIsLoading) {
    if (notifdata !== null && notifdata !== undefined) {
      return (
        <View style={styles.container}>
          <FlatList
            data={notifdata as FRNotification[]}
            renderItem={({ item }) => <Item title={item.message} />}
            keyExtractor={(item) => item.created_at.toMillis().toString()}
          />
          <Text style={styles.title}>Notifications Page</Text>
          <Button title="Show Alert" onPress={handlePress} />
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
