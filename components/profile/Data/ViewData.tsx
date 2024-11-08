import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fetchPagesReadData } from "../../../services/firebase-services/DataQueries";
import {
  type LineDataPointModel,
  type WeekDataPointModel,
} from "../../../types";
import { useAuth } from "../../auth/context";
import ViewDataChart from "../../chart/ViewDataChart";
import DataSnapShot from "../../datasnapshot/DataSnapShot";
import WormLoader from "../../wormloader/WormLoader";
import { useNavigateToBadgePage } from "../hooks/useRouteHooks";

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

interface ViewDataProps {
  userID: string;
}

const ViewData = ({ userID }: ViewDataProps) => {
  const {
    data: pagesData,
    isLoading: isLoadingPagesData,
    isError: isErrorPages,
  } = useQuery({
    queryKey: ["pagesData", userID],
    queryFn: async () => {
      const pagesReadData = await fetchPagesReadData(userID);
      return pagesReadData;
    },
  });

  const { user } = useAuth();
  const navigateToBadgePage = useNavigateToBadgePage(userID);

  if (isLoadingPagesData) {
    return (
      <View style={styles.container}>
        <WormLoader style={{ width: 50, height: 50 }} />
      </View>
    );
  }

  if (isErrorPages) {
    return (
      <View style={styles.container}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  const aggregatedPagesData =
    pagesData !== undefined ? aggregatePagesDataByWeek(pagesData) : [];

  return (
    <ScrollView style={{ flex: 1 }}>
      <DataSnapShot userID={userID} isLoadingOther={isLoadingPagesData} />
      {userID === user?.uid && (
        <TouchableOpacity onPress={navigateToBadgePage}>
          <View>
            <Text>yo</Text>
          </View>
        </TouchableOpacity>
      )}
      <View>
        <Text style={styles.dataType}>Pages Read:</Text>
        {aggregatedPagesData.length > 0 ? (
          <ViewDataChart aggregatedData={aggregatedPagesData}></ViewDataChart>
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
