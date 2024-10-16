import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { useGetBooksForBookshelves } from "../profile/hooks/useBookshelfQueries";
import { useGetPagesData } from "./hooks/useDataQueries";
import {
  calculateBooksWithinMonth,
  calculatePagesWithinWeek,
  findTopGenre,
} from "./util/datasnapshotUtils";

interface DataSnapProps {
  userID: string;
}

const DataSnapShot = ({ userID }: DataSnapProps) => {
  const { data: pagesData } = useGetPagesData(userID);

  const { data: bookshelves } = useGetBooksForBookshelves(userID);

  let pagesRead = 0;
  if (!(pagesData == null)) {
    pagesRead = calculatePagesWithinWeek(pagesData);
  }

  let booksFinished = 0;
  if (!(bookshelves == null)) {
    booksFinished = calculateBooksWithinMonth(bookshelves.finished);
  }

  let topGenre = "";
  if (!(bookshelves == null)) {
    topGenre = findTopGenre(
      bookshelves.finished,
      bookshelves.currently_reading,
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsWrap}>
        <Text style={styles.statTitle}>PAGES THIS WEEK</Text>
        <Text style={styles.stat}>{pagesRead}</Text>
      </View>
      <View
        style={[
          styles.statsWrap,
          { borderLeftWidth: 1, borderLeftColor: "#FB6D0B" },
        ]}
      >
        <Text style={styles.statTitle}>BOOKS THIS MONTH</Text>
        <Text style={styles.stat}>{booksFinished}</Text>
      </View>
      <View
        style={[
          styles.statsWrap,
          { borderLeftWidth: 1, borderLeftColor: "#FB6D0B" },
        ]}
      >
        <Text style={styles.statTitle}>TOP BOOK GENRE</Text>
        <Text style={styles.stat}>{topGenre}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: APP_BACKGROUND_COLOR,
    flexDirection: "row",
    borderBottomColor: "#F2F2F2",
    // borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  statsWrap: {
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    // width: 145,
    // height: 80,
    padding: 10,
  },
  statTitle: {
    fontSize: 13,
    alignSelf: "center",
    paddingBottom: 5,
  },
  stat: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
});

export default DataSnapShot;
