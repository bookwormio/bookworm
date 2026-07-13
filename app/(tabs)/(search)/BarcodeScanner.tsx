import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isValidISBN } from "../../../services/util/bookQueryUtils";
import { useVolumeIDMutation } from "./hooks/useBarcodeQueries";

const BarcodeScanner = () => {
  const router = useRouter();
  const [showScanError, setShowScanError] = useState(false);
  const [lastScannedISBN, setLastScannedISBN] = useState("");
  const getVolumeIDMutation = useVolumeIDMutation();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission == null) {
      requestPermission().catch((error) => {
        console.error("Error requesting camera permissions", error);
      });
    }
  }, [permission, requestPermission]);

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

  if (permission == null || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          {permission == null
            ? "Checking camera permission..."
            : "No access to camera. Please enable camera access in Settings to scan a book."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        autofocus="on"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        style={StyleSheet.absoluteFill}
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
    ...StyleSheet.absoluteFill,
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
  permissionText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
