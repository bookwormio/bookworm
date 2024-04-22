import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useAuth } from "../../../components/auth/context";
import {
  fetchPagesReadData,
  fetchTimeReadData,
} from "../../../services/firebase-services/queries";
import {
  type LineDataPointModel,
  type WeekDataPointModel,
} from "../../../types";

const ViewGraphs = () => {
  const { user } = useAuth();
  const [queriedPagesData, setPagesData] = useState<LineDataPointModel[]>([]);
  const [queriedTimeData, setTimeData] = useState<LineDataPointModel[]>([]);
  const [aggregatedPagesData, setAggregatedPagesData] = useState<
    WeekDataPointModel[]
  >([]);
  const [aggregatedTimeData, setAggregatedTimeData] = useState<
    WeekDataPointModel[]
  >([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);

  const { data: pagesData, isLoading: isLoadingPagesData } = useQuery({
    queryKey: user != null ? ["pagesData", user.uid] : ["pagesData"],
    queryFn: async () => {
      if (user != null) {
        const pagesReadData = await fetchPagesReadData(user.uid);
        setPagesLoading(false);
        return pagesReadData;
      } else {
        return {};
      }
    },
  });

  const { data: timeData, isLoading: isLoadingTimeData } = useQuery({
    queryKey: user != null ? ["timeData", user.uid] : ["timeData"],
    queryFn: async () => {
      if (user != null) {
        const timeReadData = await fetchTimeReadData(user.uid);
        setTimeLoading(false);
        return timeReadData;
      } else {
        return {};
      }
    },
  });

  useEffect(() => {
    if (pagesData !== undefined && pagesData !== null) {
      const pagesDataAsPointModel = pagesData as LineDataPointModel[];
      setPagesData(pagesDataAsPointModel);
    }
  }, [pagesData]);

  useEffect(() => {
    if (timeData !== undefined && timeData !== null) {
      const timeDataAsPointModel = timeData as LineDataPointModel[];
      setTimeData(timeDataAsPointModel);
    }
  }, [timeData]);

  // TODO: move these fcns to top of page and call from within component
  useEffect(() => {
    const aggregatePagesDataByWeek = (
      data: LineDataPointModel[],
    ): WeekDataPointModel[] => {
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

      const aggregatedArray: WeekDataPointModel[] = Object.entries(
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
      data: LineDataPointModel[],
    ): WeekDataPointModel[] => {
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

      const aggregatedArray: WeekDataPointModel[] = Object.entries(
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

  if (isLoadingPagesData || pagesLoading || isLoadingTimeData || timeLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text style={styles.dataType}>Pages Read:</Text>
      </View>
      <View>
        {aggregatedPagesData.map(({ x, y }) => (
          <View key={x.toISOString()}>
            <Text>
              {x.toDateString().slice(4, 10)} - {x.getDate() + 6}: {y}
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
              {x.toDateString().slice(4, 10)} - {x.getDate() + 6}: {y}
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
