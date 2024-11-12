import { useMutation } from "@tanstack/react-query";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fetchBookVolumeIDByISBN } from "../../../services/books-services/BookQueries";
import { isValidISBN } from "../../../services/util/bookQueryUtils";

const BarcodeScanner = () => {
  const router = useRouter();
  const [showScanError, setShowScanError] = useState(false);
  const getVolumeIDMutation = useMutation({
    mutationFn: async (isbn: string) => await fetchBookVolumeIDByISBN(isbn),
  });
  const handleFetchVolumeID = (isbn: string) => {
    getVolumeIDMutation.mutate(isbn, {
      onSuccess: (scannedVolumeID) => {
        if (scannedVolumeID !== null) {
          router.replace(`/searchbook/${scannedVolumeID}`);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={"back"}
        onBarcodeScanned={({ data }: { data: string }) => {
          if (isValidISBN(data)) {
            setShowScanError(false);
            handleFetchVolumeID(data);
          } else {
            setShowScanError(true);
          }
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.cutout} />
        {showScanError && (
          <Text style={styles.overlayText}>
            Couldn't read book's ISBN. Please try again.
          </Text>
        )}
      </View>
    </View>
  );
};

export default BarcodeScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cutout: {
    width: "70%",
    height: 180,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  overlayText: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 20,
    textAlign: "center",
    zIndex: 3,
  },
});
