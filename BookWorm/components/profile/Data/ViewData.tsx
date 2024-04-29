import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  fetchPagesReadData,
  fetchTimeReadData,
} from "../../../services/firebase-services/queries";
import {
  type LineDataPointModel,
  type WeekDataPointModel,
} from "../../../types";
import { useAuth } from "../../auth/context";
import ViewDataChart from "../../chart/ViewDataChart";

// TODO: Combine these functions into a single generic
function aggregatePagesDataByWeek(
  data: LineDataPointModel[],
): WeekDataPointModel[] {
  const aggregatedPagesData: Record<string, number> = {};
  data.forEach(({ x, y }) => {
    const date = new Date(x * 1000); // multiply by 1000 for milliseconds

    const startOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay(),
    );

    const weekKey = startOfWeek.toISOString();

    if (aggregatedPagesData[weekKey] === undefined) {
      aggregatedPagesData[weekKey] = 0;
    }

    aggregatedPagesData[weekKey] += y;
  });

  const aggregatedArray: WeekDataPointModel[] = Object.entries(
    aggregatedPagesData,
  ).map(([weekKey, sum]) => ({
    x: new Date(weekKey),
    y: sum,
  }));

  // Sort the aggregated data by week in ascending order
  aggregatedArray.sort((a, b) => a.x.getTime() - b.x.getTime());

  return aggregatedArray;
}

function aggregateTimeDataByWeek(
  data: LineDataPointModel[],
): WeekDataPointModel[] {
  const aggregatedTimeData: Record<string, number> = {};

  data.forEach(({ x, y }) => {
    const date = new Date(x * 1000); // multiply by 1000 for milliseconds

    const startOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay(),
    );

    const weekKey = startOfWeek.toISOString();

    if (aggregatedTimeData[weekKey] === undefined) {
      aggregatedTimeData[weekKey] = 0;
    }

    aggregatedTimeData[weekKey] += y;
  });

  const aggregatedArray: WeekDataPointModel[] = Object.entries(
    aggregatedTimeData,
  ).map(([weekKey, sum]) => ({
    x: new Date(weekKey),
    y: sum,
  }));

  // Sort the aggregated data by week in ascending order
  aggregatedArray.sort((a, b) => a.x.getTime() - b.x.getTime());
  return aggregatedArray;
}

const ViewData = () => {
  const { user } = useAuth();

  const {
    data: pagesData,
    isLoading: isLoadingPagesData,
    isError: isErrorPages,
  } = useQuery({
    queryKey: user != null ? ["pagesData", user.uid] : ["pagesData"],
    queryFn: async () => {
      if (user != null) {
        const pagesReadData = await fetchPagesReadData(user.uid);
        return pagesReadData;
      } else {
        return [];
      }
    },
  });

  const {
    data: timeData,
    isLoading: isLoadingTimeData,
    isError: isErrorTime,
  } = useQuery({
    queryKey: user != null ? ["timeData", user.uid] : ["timeData"],
    queryFn: async () => {
      if (user != null) {
        const timeReadData = await fetchTimeReadData(user.uid);
        return timeReadData;
      } else {
        return [];
      }
    },
  });

  if (isLoadingPagesData || isLoadingTimeData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isErrorPages || isErrorTime) {
    return (
      <View style={styles.container}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  const aggregatedPagesData =
    pagesData !== undefined ? aggregatePagesDataByWeek(pagesData) : [];

  const aggregatedTimeData =
    timeData !== undefined ? aggregateTimeDataByWeek(timeData) : [];

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <Text style={styles.dataType}>Pages Read:</Text>
        {aggregatedPagesData.length > 0 ? (
          <ViewDataChart aggregatedData={aggregatedPagesData}></ViewDataChart>
        ) : (
          <Text>No data to display</Text>
        )}
      </View>
      <View></View>
      <View>
        <Text style={styles.dataType}>Minutes Read:</Text>
        {aggregatedTimeData.length > 0 ? (
          <ViewDataChart aggregatedData={aggregatedTimeData}></ViewDataChart>
        ) : (
          <Text>No data to display</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ViewData;

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
    marginLeft: 10,
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
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
});
