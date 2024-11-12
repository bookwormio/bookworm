import { CameraView } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";

const BarcodeScanner = () => {
  return (
    <View>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          console.log(data);
        }}
      ></CameraView>
    </View>
  );
};

export default BarcodeScanner;
