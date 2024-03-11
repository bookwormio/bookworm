import { Camera, CameraType, FlashMode } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const CameraView = () => {
  const cameraRef = useRef<Camera | null>(null);
  const [image, setImage] = useState("");
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    MediaLibrary.requestPermissionsAsync().catch((error) => {
      alert(error);
    });
    handleCameraPermission().catch((error: string) => {
      alert(error);
    });
  }, []);

  const handleCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const takePicture = async () => {
    if (cameraRef.current != null) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        setImage(data.uri);
      } catch (error) {
        alert(error);
      }
    }
  };

  const savePicture = async () => {
    if (image !== "") {
      try {
        await MediaLibrary.createAssetAsync(image);
        setImage("");
      } catch (error) {
        alert(error);
      }
    }
  };

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {image === "" ? (
        <Camera
          style={styles.camera}
          type={type}
          ref={cameraRef}
          flashMode={flash}
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
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back,
                );
              }}
            />
            <Button
              onPress={() => {
                setFlash(
                  flash === FlashMode.off ? FlashMode.on : FlashMode.off,
                );
              }}
              title="Flash"
              color={flash === FlashMode.off ? "gray" : "#fff"}
            />
          </View>
        </Camera>
      ) : (
        <Image source={{ uri: image }} style={styles.camera} />
      )}

      <View style={styles.controls}>
        {image !== "" ? (
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
                setImage("");
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
