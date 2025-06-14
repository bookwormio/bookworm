import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  APP_BACKGROUND_COLOR,
  BOOKWORM_LIGHT_GREY,
  BOOKWORM_ORANGE,
} from "../../constants/constants";
import { useGetBooksForBookshelves } from "../profile/hooks/useBookshelfQueries";
import { useGetPagesData } from "./hooks/useDataQueries";
import {
  calculateBooksWithinMonth,
  calculatePagesWithinWeek,
  findYearTopGenre,
} from "./util/datasnapshotUtils";

interface DataSnapShotProps {
  userID: string;
  isLoadingOther: boolean;
  optionalBorder?: boolean;
}

const DataSnapShot = ({
  userID,
  isLoadingOther,
  optionalBorder = false,
}: DataSnapShotProps) => {
  const { data: pagesData, isLoading: pagesIsLoading } =
    useGetPagesData(userID);

  const { data: bookshelves, isLoading: bookshelvesLoading } =
    useGetBooksForBookshelves(userID);

  let pagesRead = 0;
  if (pagesData != null) {
    pagesRead = calculatePagesWithinWeek(pagesData);
  }

  let booksFinished = 0;
  let topGenre = "";
  if (bookshelves != null) {
    topGenre = findYearTopGenre(
      bookshelves.finished,
      bookshelves.currently_reading,
    );
    booksFinished = calculateBooksWithinMonth(bookshelves.finished);
  }

  return (
    <View>
      {!(pagesIsLoading || bookshelvesLoading || isLoadingOther) && (
        <View style={optionalBorder ? styles.dataSnapBorder : { flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.statsWrap}>
              <Text style={styles.statTitle}>PAGES THIS WEEK</Text>
              <Text style={styles.stat}>{pagesRead}</Text>
            </View>
            <View style={[styles.statsWrap, styles.leftBorder]}>
              <Text style={styles.statTitle}>BOOKS THIS MONTH</Text>
              <Text style={styles.stat}>{booksFinished}</Text>
            </View>
            <View style={[styles.statsWrap, styles.leftBorder]}>
              <Text style={styles.statTitle}>TOP BOOK GENRE</Text>
              <Text style={styles.stat}>{topGenre}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: APP_BACKGROUND_COLOR,
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 0,
  },
  statsWrap: {
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    width: "33%",
    padding: 5,
  },
  statTitle: {
    alignSelf: "center",
    paddingBottom: 5,
    flexWrap: "wrap",
    textAlign: "center",
    fontSize: 13,
  },
  stat: {
    fontWeight: "bold",
    alignSelf: "center",
    flexWrap: "wrap",
    textAlign: "center",
    fontSize: 16,
  },
  leftBorder: {
    borderLeftWidth: 1,
    borderLeftColor: BOOKWORM_ORANGE,
  },
  dataSnapBorder: {
    borderBottomWidth: 5,
    paddingBottom: 10,
    borderColor: BOOKWORM_LIGHT_GREY,
  },
});

export default DataSnapShot;
