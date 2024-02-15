import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import Posts from "../posts";
import Profile from "../profile";
import Search from "../search";

export default function BottomTabs() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Posts" component={Posts} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
