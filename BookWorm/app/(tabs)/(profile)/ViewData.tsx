import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-charts-wrapper";
import { useAuth } from "../../../components/auth/context";
import { fetchPagesReadData } from "../../../services/firebase-services/queries";

interface LineDataPoint {
  x: number; // Assuming time is represented as a number
  y: number; // Assuming pages is represented as a number
}

const ViewGraphs = () => {
  const { user } = useAuth();
  const [queriedData, setQueriedData] = useState<LineDataPoint[]>([]);
  // TODO: fix fetchPagesReadData
  useEffect(() => {
    // Fetch data from the database when the component mounts
    const fetchDataAndUpdateState = async () => {
      if (user !== null) {
        try {
          // Call the fetchData function to get the data asynchronously
          const newDataPoints = await fetchPagesReadData(user.uid);
          // Update the state with the fetched data
          setQueriedData(newDataPoints);
        } catch (error) {
          // Handle errors if necessary
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchDataAndUpdateState().catch((error) => {
      // Handle any errors that occur during the fetchDataAndUpdateState function
      console.error("Error calling fetchDataAndUpdateState:", error);
    });
  });

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Close"
        color="midnightblue"
        onPress={() => {
          router.back();
        }}
      />
      <View style={styles.container}>
        <LineChart
          style={styles.chart}
          data={{
            dataSets: [{ label: "demo", values: queriedData }],
          }}
        />
      </View>
    </View>
  );
};

export default ViewGraphs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  chart: {
    flex: 1,
  },
});
