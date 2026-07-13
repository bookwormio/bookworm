import {
  CameraView as ExpoCamera,
  useCameraPermissions,
  type CameraType,
  type FlashMode,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const CameraView = () => {
  const cameraRef = useRef<ExpoCamera | null>(null);
  const [imageURI, setImageURI] = useState("");
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission == null) {
      requestPermission().catch((error) => {
        alert(error);
      });
    }
    MediaLibrary.requestPermissionsAsync().catch((error) => {
      alert(error);
    });
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (cameraRef.current != null) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        if (data?.uri != null) {
          setImageURI(data.uri);
        }
      } catch (error) {
        alert(error);
      }
    }
  };

  const savePicture = async () => {
    if (imageURI !== "") {
      try {
        await MediaLibrary.createAssetAsync(imageURI);
        setImageURI("");
      } catch (error) {
        alert(error);
      }
    }
  };

  if (permission?.granted === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {imageURI === "" ? (
        <ExpoCamera
          style={styles.camera}
          facing={cameraType}
          ref={cameraRef}
          flash={flashMode}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 30,
            }}
          >
            <Button
              title="Flip"
              onPress={() => {
                setCameraType(cameraType === "back" ? "front" : "back");
              }}
            />
            <Button
              onPress={() => {
                setFlashMode(flashMode === "off" ? "on" : "off");
              }}
              title="Flash"
              color={flashMode === "off" ? "gray" : "#fff"}
            />
          </View>
        </ExpoCamera>
      ) : (
        <Image source={{ uri: imageURI }} style={styles.camera} />
      )}

      <View style={styles.controls}>
        {imageURI !== "" ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 50,
            }}
          >
            <Button
              title="Re-take"
              onPress={() => {
                setImageURI("");
              }}
            />
            <Button
              title="Save"
              onPress={() => {
                savePicture()
                  .then(() => {
                    router.back();
                  })
                  .catch((error) => {
                    alert(error);
                  });
              }}
            />
          </View>
        ) : (
          <Button
            title="Take a picture"
            onPress={() => {
              takePicture().catch((error) => {
                alert(error);
              });
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 8,
  },
  controls: {
    flex: 0.5,
  },
  button: {
    height: 40,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E9730F",
    marginLeft: 10,
  },
  camera: {
    flex: 5,
    borderRadius: 20,
  },
  topControls: {
    flex: 1,
  },
});

export default CameraView;
