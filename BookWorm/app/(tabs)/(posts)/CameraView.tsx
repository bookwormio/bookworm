import { Camera, CameraType, FlashMode } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const CameraView = () => {
  const cameraRef = useRef<Camera | null>(null);
  const [imageURI, setImageURI] = useState("");
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    handlePermissions().catch((error: string) => {
      alert(error);
    });
  }, []);

  const handlePermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === "granted");
    await MediaLibrary.requestPermissionsAsync();
  };

  const takePicture = async () => {
    if (cameraRef.current != null) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        setImageURI(data.uri);
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

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {imageURI === "" ? (
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={cameraRef}
          flashMode={flashMode}
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
                setCameraType(
                  cameraType === CameraType.back
                    ? CameraType.front
                    : CameraType.back,
                );
              }}
            />
            <Button
              onPress={() => {
                setFlashMode(
                  flashMode === FlashMode.off ? FlashMode.on : FlashMode.off,
                );
              }}
              title="Flash"
              color={flashMode === FlashMode.off ? "gray" : "#fff"}
            />
          </View>
        </Camera>
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
