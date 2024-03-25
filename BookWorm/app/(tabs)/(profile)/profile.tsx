import { useQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import { fetchFirstName } from "../../../services/firebase-services/queries";

const Profile = () => {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const userStr: string = user?.email ?? "No email";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pageRefresh, setPageRefresh] = useState(false);
  // const queryClient = useQueryClient();
  let first: string | undefined;
  // let last: string | undefined;
  // let number: string | undefined;

  const [isLoadingF, setIsLoadingF] = useState(false);
  // const [isLoadingL, setIsLoadingL] = useState(false);
  // const [isLoadingN, setIsLoadingN] = useState(false);

  const { data } = useQuery({
    queryKey: ["firstName"],
    queryFn: async () => {
      if (user != null) {
        return await fetchFirstName(user);
      } else {
        // Return default value when user is null
        return "";
      }
    },
  });

  console.log(data);

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (event) => {
      const { data } = event;
      if (
        data.state.routeNames[data.state.routeNames.length - 1] ===
          "EditProfile" &&
        data.state.index === 0
      ) {
        setPageRefresh((pageRefresh) => !pageRefresh);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user != null) {
          // const { data: firstData } = useQuery({
          //   queryKey: ["firstName"],
          //   queryFn: async () => await fetchFirstName(user),
          // });
          // first = firstData;
          // setIsLoadingF(isLoadingFirst);
          // const { data: lastData, isLoading: isLoadingLast } = useQuery({
          //   queryKey: ["lastName", user.uid],
          //   queryFn: async () => await fetchLastName(user),
          // });
          // last = lastData;
          // setIsLoadingL(isLoadingLast);
          // const { data: numberData, isLoading: isLoadingNumber } = useQuery({
          //   queryKey: ["phoneNumber", user.uid],
          //   queryFn: async () => await fetchPhoneNumber(user),
          // });
          // number = numberData;
          // setIsLoadingN(isLoadingNumber);
          // const firstName: string = await fetchFirstName(user);
          // const lastName: string = await fetchLastName(user);
          // const phoneNumber: string = await fetchPhoneNumber(user);
          // setFirstName(first ?? "");
          // setLastName(last);
          // setPhoneNumber(number);
        } else {
          console.error("user DNE");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData().catch((error) => {
      console.error("Error fetching first name:", error);
    });
  }, [pageRefresh]);

  // if (isLoadingF || isLoadingL || isLoadingN) {
  //   return <ActivityIndicator size="large" color="#0000ff" />;
  // }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text>Current User email: {userStr}</Text>
      <Text>
        Current User Name: {firstName} {lastName}
      </Text>
      <Button title="LogOut" onPress={signOut} />
      <Button
        title="Edit Profile"
        onPress={() => {
          if (user != null) {
            router.push({
              pathname: "EditProfile",
              params: {
                phoneNumber,
                firstName,
                lastName,
              },
            });
          } else {
            console.error("User DNE");
          }
        }}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
