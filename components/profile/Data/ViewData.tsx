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
import { useRouter } from "expo-router";
import { BOOKWORM_ORANGE } from "../../../constants/constants";
import {
  fetchBooksFinishedData,
  fetchPagesReadData,
} from "../../../services/firebase-services/DataQueries";
import {
  type LineDataPointModel,
  type MonthDataPointModel,
  type WeekDataPointModel,
} from "../../../types";
import { useAuth } from "../../auth/context";
import ViewBookBarChart from "../../chart/ViewBookBarChart";
import ViewDataChart from "../../chart/ViewDataChart";
import DataSnapShot from "../../datasnapshot/DataSnapShot";
import WormLoader from "../../wormloader/WormLoader";

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

/**
 * Aggregates books finished by month to get sum of books per month
 * @param data dataset of books finished with corresponding dates
 * @returns data in the form x: timestamp for month, y: books finished
 */
function AggregateBooksFinishedByMonth(
  data: LineDataPointModel[],
): MonthDataPointModel[] {
  const aggregatedBooksData: Record<string, number> = {};
  data.forEach(({ x }) => {
    const date = new Date(x * 1000); // multiply by 1000 for milliseconds

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const monthKey = startOfMonth.toISOString();

    if (aggregatedBooksData[monthKey] === undefined) {
      aggregatedBooksData[monthKey] = 0;
    }

    aggregatedBooksData[monthKey] += 1;
  });

  const aggregatedArray: MonthDataPointModel[] = Object.entries(
    aggregatedBooksData,
  ).map(([monthKey, sum]) => ({
    x: new Date(monthKey),
    y: sum,
  }));

  // Sort the aggregated data by month in ascending order
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

  const router = useRouter();
  const navigateToMakePostPage = () => {
    router.replace("/NewPost");
  };

  const { user } = useAuth();

  const {
    data: bookData,
    isLoading: isLoadingBookData,
    isError: isErrorWithBooks,
  } = useQuery({
    queryKey: ["bookData", userID],
    queryFn: async () => {
      const booksReadData = await fetchBooksFinishedData(userID);
      return booksReadData;
    },
  });

  if (isLoadingPagesData || isLoadingBookData) {
    return (
      <View style={styles.container}>
        <WormLoader style={styles.worm} />
      </View>
    );
  }

  if (isErrorPages || isErrorWithBooks) {
    return (
      <View style={styles.container}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  const aggregatedPagesData =
    pagesData != null ? aggregatePagesDataByWeek(pagesData) : [];

  const aggregatedBooksData =
    bookData != null ? AggregateBooksFinishedByMonth(bookData) : [];

  return (
    <ScrollView style={{ flex: 1 }}>
      <DataSnapShot userID={userID} isLoadingOther={isLoadingPagesData} />
      <View style={{ paddingTop: 5 }}>
        <View style={styles.titleBarFirst}>
          <Text style={styles.dataTypeFirst}>Pages Read</Text>
        </View>
        <View style={styles.chartContainer}>
          {aggregatedPagesData.length > 0 ? (
            <ViewDataChart aggregatedData={aggregatedPagesData}></ViewDataChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noData}>No data to display.</Text>
              {userID === user?.uid && (
                <TouchableOpacity onPress={navigateToMakePostPage}>
                  <Text style={styles.makePost}> Make a post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={styles.titleBar}>
          <Text style={styles.dataType}>Books Completed</Text>
        </View>
        <View style={styles.chartContainer}>
          {aggregatedBooksData.length > 0 ? (
            <ViewBookBarChart
              aggregatedData={aggregatedBooksData}
            ></ViewBookBarChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noData}>No data to display.</Text>
              {userID === user?.uid && (
                <TouchableOpacity onPress={navigateToMakePostPage}>
                  <Text style={styles.makePost}> Make a post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
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
  titleBar: {
    backgroundColor: "white", // Orange color
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  titleBarFirst: {
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    marginTop: 5,
    marginBottom: -10,
    borderTopWidth: 0.7,
    borderTopColor: BOOKWORM_ORANGE,
  },
  chartContainer: {
    overflow: "hidden",
    paddingRight: 40,
    marginRight: -40,
    borderBottomWidth: 0.7,
    borderBottomColor: BOOKWORM_ORANGE,
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  dataType: {
    fontSize: 17,
    fontWeight: "bold",
    color: "black",
    marginBottom: -10,
  },
  dataTypeFirst: {
    fontSize: 17,
    fontWeight: "bold",
    color: "black",
    marginTop: 10,
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
  noData: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
    paddingTop: 10,
  },
  makePost: {
    fontSize: 17,
    color: BOOKWORM_ORANGE,
    paddingTop: 10,
  },
  noDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  worm: { width: 50, height: 50 },
});
