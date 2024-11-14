import { CameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isValidISBN } from "../../../services/util/bookQueryUtils";
import { useVolumeIDMutation } from "./hooks/useBarcodeQueries";

const BarcodeScanner = () => {
  const router = useRouter();
  const [showScanError, setShowScanError] = useState(false);
  const [lastScannedISBN, setLastScannedISBN] = useState("");
  const getVolumeIDMutation = useVolumeIDMutation();

  const handleFetchVolumeID = (isbn: string) => {
    if (!getVolumeIDMutation.isPending) {
      getVolumeIDMutation.mutate(isbn, {
        onSuccess: (scannedVolumeID) => {
          if (scannedVolumeID !== null) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              .then(() => {
                router.replace(`/searchbook/${scannedVolumeID}`);
              })
              .catch((error) => {
                console.error("Error creating haptic", error);
              });
          } else {
            setShowScanError(true);
          }
        },
        onError: (error) => {
          setShowScanError(true);
          console.error("Error fetching book information", error);
        },
      });
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (data !== lastScannedISBN) {
      if (isValidISBN(data)) {
        setLastScannedISBN(data);
        setShowScanError(false);
        handleFetchVolumeID(data);
      } else {
        setShowScanError(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        autofocus="on"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.cutout} />
        {showScanError && (
          <Text style={styles.overlayText}>
            {"Couldn't read book's ISBN. Please try again."}
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
    borderWidth: 1,
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
