import { FontAwesome5 } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";
import { Tabs } from "expo-router/tabs";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../components/auth/context";

const AppLayout = () => {
  const { isLoading } = useAuth();
  const segments = useSegments();
  if (isLoading) {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: "center",
        padding: 40,
        justifyContent: "center",
      },
    });

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  const styles = StyleSheet.create({
    newPost: {
      alignItems: "center",
      justifyContent: "center",
      marginRight: 20,
    },
  });

  return (
    <Tabs>
      <Tabs.Screen
        name="(posts)"
        options={{
          tabBarLabel: "Posts",
          headerTitle: "Posts",
          tabBarActiveTintColor: "#FB6D0B",
          tabBarInactiveTintColor: "grey",
          headerRight: () => (
            <TouchableOpacity style={styles.newPost} onPress={() => {}}>
              <FontAwesome5 name="bell" size={20} color="#FB6D0B" />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <View>
              {router.canGoBack() && (
                <TouchableOpacity
                  style={{ paddingLeft: 20 }}
                  disabled={!router.canGoBack()}
                  onPress={() => {
                    router.back();
                  }}
                >
                  <FontAwesome5 name="arrow-left" size={20} />
                </TouchableOpacity>
              )}
            </View>
          ),
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="stream" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          tabBarLabel: "Search",
          headerTitle: "Search",
          tabBarActiveTintColor: "#FB6D0B",
          tabBarInactiveTintColor: "grey",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="search" size={size} color={color} />
          ),
          headerLeft: () => (
            <View>
              {router.canGoBack() &&
                // ensure not at base search page
                segments[segments.length - 1] !== "search" && (
                  <TouchableOpacity
                    style={{ paddingLeft: 20 }}
                    disabled={!router.canGoBack()}
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <FontAwesome5 name="arrow-left" size={20} />
                  </TouchableOpacity>
                )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(create)"
        options={{
          tabBarLabel: "Create",
          headerTitle: "Create",
          tabBarActiveTintColor: "#FB6D0B",
          tabBarInactiveTintColor: "grey",
          tabBarIcon: ({ size, focused, color }) => (
            <FontAwesome5 name="book-medical" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarLabel: "Profile",
          headerTitle: "Profile",
          tabBarActiveTintColor: "#FB6D0B",
          tabBarInactiveTintColor: "grey",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="id-card" size={size} color={color} />
          ),
          headerLeft: () => (
            <View>
              {router.canGoBack() &&
                segments[2] !== "profile" &&
                segments[2] !== "EditProfile" && (
                  <TouchableOpacity
                    style={{ paddingLeft: 20 }}
                    disabled={!router.canGoBack()}
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <FontAwesome5 name="arrow-left" size={20} color="#FB6D0B" />
                  </TouchableOpacity>
                )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default AppLayout;
