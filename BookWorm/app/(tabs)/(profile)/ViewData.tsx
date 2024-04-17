import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuth } from "../../../components/auth/context";
import {
    fetchPagesReadData,
    fetchTimeReadData,
} from "../../../services/firebase-services/queries";

interface LineDataPoint {
  x: number; // time in seconds
  y: number; // pages or minutes
}

interface WeekDataPoint {
  x: Date; // time as week
  y: number;
}

const ViewGraphs = () => {
  const { user } = useAuth();
  const [queriedPagesData, setPagesData] = useState<LineDataPoint[]>([]);
  const [queriedTimeData, setTimeData] = useState<LineDataPoint[]>([]);
  const [aggregatedPagesData, setAggregatedPagesData] = useState<
    WeekDataPoint[]
  >([]);
  const [aggregatedTimeData, setAggregatedTimeData] = useState<WeekDataPoint[]>(
    [],
  );

  // TODO: fix fetchPagesReadData
  useEffect(() => {
    // Fetch data from the database when the component mounts
    const fetchPagesDataAndUpdateState = async () => {
      if (user !== null) {
        try {
          // Call the fetchData function to get the data asynchronously
          const newDataPoints = await fetchPagesReadData(user.uid);
          // Update the state with the fetched data
          setPagesData(newDataPoints);
        } catch (error) {
          // Handle errors if necessary
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchPagesDataAndUpdateState().catch((error) => {
      // Handle any errors that occur during the fetchDataAndUpdateState function
      console.error("Error calling fetchPagesDataAndUpdateState:", error);
    });
  });

  useEffect(() => {
    // Fetch data from the database when the component mounts
    const fetchTimeDataAndUpdateState = async () => {
      if (user !== null) {
        try {
          // Call the fetchData function to get the data asynchronously
          const newDataPoints = await fetchTimeReadData(user.uid);
          // Update the state with the fetched data
          setTimeData(newDataPoints);
        } catch (error) {
          // Handle errors if necessary
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchTimeDataAndUpdateState().catch((error) => {
      // Handle any errors that occur during the fetchDataAndUpdateState function
      console.error("Error calling fetchTimeDataAndUpdateState:", error);
    });
  });

  useEffect(() => {
    const aggregatePagesDataByWeek = (
      data: LineDataPoint[],
    ): WeekDataPoint[] => {
      const aggregatedPagesData: Record<string, number> = {};

      data.forEach(({ x, y }) => {
        const date = new Date(x * 1000); // multiply by 1000 for milliseconds

        const startOfWeek = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - date.getDay(),
        );

        const weekKey = startOfWeek.toISOString();

        if (Number.isNaN(aggregatedPagesData[weekKey])) {
          aggregatedPagesData[weekKey] = 0;
        }

        aggregatedPagesData[weekKey] += y;
      });

      const aggregatedArray: WeekDataPoint[] = Object.entries(
        aggregatedPagesData,
      ).map(([weekKey, sum]) => ({
        x: new Date(weekKey),
        y: sum,
      }));

      // Sort the aggregated data by week in ascending order
      aggregatedArray.sort((a, b) => a.x.getTime() - b.x.getTime());

      return aggregatedArray;
    };

    // Call the aggregateDataByWeek function with queriedData and update state
    setAggregatedPagesData(aggregatePagesDataByWeek(queriedPagesData));
  }, [queriedPagesData]);

  useEffect(() => {
    const aggregateTimeDataByWeek = (
      data: LineDataPoint[],
    ): WeekDataPoint[] => {
      const aggregatedTimeData: Record<string, number> = {};

      data.forEach(({ x, y }) => {
        const date = new Date(x * 1000); // multiply by 1000 for milliseconds

        const startOfWeek = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - date.getDay(),
        );

        const weekKey = startOfWeek.toISOString();

        if (Number.isNaN(aggregatedTimeData[weekKey])) {
          aggregatedTimeData[weekKey] = 0;
        }

        aggregatedTimeData[weekKey] += y;
      });

      const aggregatedArray: WeekDataPoint[] = Object.entries(
        aggregatedTimeData,
      ).map(([weekKey, sum]) => ({
        x: new Date(weekKey),
        y: sum,
      }));

      // Sort the aggregated data by week in ascending order
      aggregatedArray.sort((a, b) => a.x.getTime() - b.x.getTime());

      return aggregatedArray;
    };

    // Call the aggregateDataByWeek function with queriedData and update state
    setAggregatedTimeData(aggregateTimeDataByWeek(queriedTimeData));
  }, [queriedTimeData]);

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text style={styles.dataType}>Pages Read:</Text>
      </View>
      <View>
        {aggregatedPagesData.map(({ x, y }) => (
          <View key={x.toISOString()}>
            <Text>
              {x.toDateString().slice(4)}: {y}
            </Text>
          </View>
        ))}
      </View>
      <View>
        <Text style={styles.dataType}>Minutes Read:</Text>
      </View>
      <View>
        {aggregatedTimeData.map(({ x, y }) => (
          <View key={x.toISOString()}>
            <Text>
              {x.toDateString().slice(4)}: {y}
            </Text>
          </View>
        ))}
      </View>
      {/* <View style={styles.container}>
        <LineChart
          style={styles.chart}
          data={{
            dataSets: [{ label: "demo", values: queriedPagesData }],
          }}
        />
      </View> */}
    </View>
  );
};

export default ViewGraphs;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  dataType: {
    fontSize: 36,
    color: "#FB6D0B",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
    marginTop: 20,
  },
  bioPad: {
    paddingLeft: 40,
  },
  SnapshotText: {
    paddingLeft: 20,
    fontSize: 30,
    marginTop: -10,
  },
  locText: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
});
