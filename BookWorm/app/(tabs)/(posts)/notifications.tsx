import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import { getAllFullNotifications } from "../../../services/firebase-services/NotificationQueries";

const NotificationsScreen = () => {
  const handlePress = () => {
    alert("Hello World! This is a notification.");
  };

  const { user } = useAuth();

  const { data: notifdata, isLoading: notifIsLoading } = useQuery({
    queryKey: user != null ? ["notifications", user.uid] : ["notifications"],
    queryFn: async () => {
      if (user != null) {
        return await getAllFullNotifications(user.uid);
      } else {
        return [];
      }
    },
  });

  if (!notifIsLoading) {
    // console.log(notifdata);
    if (notifdata !== null && notifdata !== undefined) {
      return (
        <View style={styles.container}>
          <FlatList
            style={{ flex: 1, width: "100%" }}
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
                <TouchableOpacity
                  style={styles.notif_container}
                  onPress={() => {
                    // TODO: Trying to route to the post page from the notification, not working :(
                    router.push({
                      pathname: `/${item.postID}`,
                    });
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 18,
                      paddingLeft: 20,
                    }}
                  >
                    {item.type === "FRIEND_REQUEST" ? "NEW FOLLOWER" : ""}
                    {item.type === "COMMENT" ? "NEW COMMENT" : ""}
                    {item.type === "LIKE" ? "NEW LIKE" : ""}
                  </Text>
                  <View style={styles.imageTextContainer}>
                    <View style={styles.defaultImageContainer}>
                      {item.sender_img !== "" ? (
                        <Image
                          style={styles.defaultImage}
                          source={{ uri: item.sender_img }}
                          resizeMode="cover"
                        />
                      ) : (
                        <FontAwesome5 name="user" size={40} color="black" />
                      )}
                    </View>
                    <Text
                      style={{ paddingLeft: 20, flexWrap: "wrap", flex: 1 }}
                    >
                      {item.sender_name} {item.message}
                      {item.type === "COMMENT" ? item.comment : ""} on{" "}
                      {formattedDate}
                    </Text>
                  </View>
                </TouchableOpacity>
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
  notif_container: {
    flex: 1,
    flexDirection: "column",
    paddingBottom: 10,
    paddingTop: 10,
    paddingRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
    marginTop: 20,
    flexWrap: "wrap",
  },
  defaultImageContainer: {
    backgroundColor: "#d3d3d3",
    height: 60,
    width: 60,
    borderColor: "black",
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  defaultImage: {
    height: "100%", // Adjust the size of the image as needed
    width: "100%", // Adjust the size of the image as needed
    borderRadius: 30, // Make the image circular
  },
});

export default NotificationsScreen;
