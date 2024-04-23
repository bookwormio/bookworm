import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import { HOURS, MINUTES } from "../../../constants/constants";
import { addDataEntry } from "../../../services/firebase-services/queries";
import { type CreateTrackingModel } from "../../../types";

const AddData = () => {
  const { user } = useAuth();
  const [pagesRead, setPagesRead] = useState<string>("");
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const trackingMutation = useMutation({
    mutationFn: addDataEntry,
  });
  const [loading, setLoading] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);

  const createNewTracking = () => {
    if (user !== null && user !== undefined) {
      setLoading(true);
      const tracking: CreateTrackingModel = {
        userid: user.uid,
        pagesRead: +pagesRead,
        minutesRead: 60 * selectedHours + selectedMinutes,
      };
      trackingMutation.mutate(tracking);
      setSelectedHours(0);
      setSelectedMinutes(0);
      setPagesRead("");
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Tracking Added",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Current user is undefined",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="black" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View>
      <Button
        title="Close"
        color="#FB6D0B"
        onPress={() => {
          router.back();
        }}
      />
      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <Text style={{ color: "#C7C7CD" }}>Time Read: </Text>
          <RNPickerSelect
            placeholder={{
              label: "0",
              value: "0",
            }}
            items={HOURS}
            value={selectedHours}
            onValueChange={(hoursString: string) => {
              setSelectedHours(+hoursString);
            }}
            style={pickerSelectStyles}
          />
          <Text> hrs </Text>
          <RNPickerSelect
            placeholder={{
              label: "0",
              value: "0",
            }}
            items={MINUTES}
            value={selectedMinutes}
            onValueChange={(minutesString: string) => {
              setSelectedMinutes(+minutesString);
            }}
            style={pickerSelectStyles}
          />
          <Text> mins </Text>
        </View>
        <TextInput
          style={styles.pagesInput}
          value={pagesRead}
          keyboardType="numeric"
          placeholder="Pages Read"
          onChangeText={(pages) => {
            setPagesRead(pages);
          }}
        />
      </View>
      <Button
        title="Save"
        color="#FB6D0B"
        onPress={() => {
          if (user != null) {
            setButtonClicked(true);
            createNewTracking();
            router.back();
          } else {
            console.error("User DNE");
          }
        }}
        disabled={buttonClicked}
      />
    </View>
  );
};

export default AddData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
    width: "100%",
    marginTop: 10,
  },
  pagesInput: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: "30%",
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 7,
    backgroundColor: "white",
    borderRadius: 50,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center", // Vertically center the items
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "grey",
    height: "100%",
    paddingHorizontal: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  placeholder: {
    color: "black",
  },
  inputIOS: {
    fontSize: 16,
    width: 30,
    height: 30,
    borderRadius: 5,
    color: "black",
    backgroundColor: "#c9ccd3",
    textAlign: "center",
    marginTop: "10%",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
