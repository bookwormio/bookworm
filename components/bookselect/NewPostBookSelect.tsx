import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { useNewPostContext } from "../../app/(tabs)/(create)/NewPostContext";
import { type BookVolumeInfo, type FlatBookItemModel } from "../../types";
import BookSearch from "../searchbar/booksearch";

const NewPostBookSelect = () => {
  const [searchPhrase, setSearchPhrase] = useState("");
  const { setSelectedBook } = useNewPostContext();

  const handleBookClickOverride = (
    bookID: string,
    volumeInfo: BookVolumeInfo,
  ) => {
    const flatBook: FlatBookItemModel = {
      id: bookID,
      title: volumeInfo?.title ?? "",
      image: volumeInfo?.imageLinks?.smallThumbnail ?? "",
      author: volumeInfo?.authors?.[0] ?? "",
      pageCount: volumeInfo?.pageCount,
      subtitle: volumeInfo?.subtitle,
      authors: volumeInfo?.authors,
      publisher: volumeInfo?.publisher,
      publishedDate: volumeInfo?.publishedDate,
      description: volumeInfo?.description,
      categories: volumeInfo?.categories,
      maturityRating: volumeInfo?.maturityRating,
      previewLink: volumeInfo?.previewLink,
      averageRating: volumeInfo?.averageRating,
      ratingsCount: volumeInfo?.ratingsCount,
      language: volumeInfo?.language,
      mainCategory: volumeInfo?.mainCategory,
    };
    setSelectedBook(flatBook);
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <BookSearch
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        handleBookClickOverride={handleBookClickOverride}
      />
    </View>
  );
};

export default NewPostBookSelect;
