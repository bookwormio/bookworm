import React from "react";
import { Text, View } from "react-native";
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
    <View>
      <Text>Pages Read: {pagesRead}</Text>
      <Text>Books Finished This Month: {booksFinished}</Text>
      <Text>Top Genre: {topGenre}</Text>
    </View>
  );
};

export default DataSnapShot;
