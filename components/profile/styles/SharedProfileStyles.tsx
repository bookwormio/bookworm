import { StyleSheet } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";

export const sharedProfileStyles = StyleSheet.create({
  imageTextContainer: {
    flexDirection: "row",
    marginLeft: 20,
    marginTop: 20,
    alignItems: "center",
  },
  followTextContainer: {
    flexDirection: "row",
    marginLeft: 20,
    marginTop: 15,
    alignItems: "center",
  },
  defaultImageContainer: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  nameText: {
    paddingLeft: 20,
    fontSize: 27,
    marginTop: -10,
  },
  locText: {
    paddingLeft: 20,
  },
  bioWrap: {
    paddingLeft: 30,
    paddingRight: 30,
    fontSize: 15,
    paddingBottom: 5,
  },
  textWrap: {
    paddingLeft: 11,
    paddingBottom: 20,
  },
  followTitle: { fontSize: 15 },
  followAmount: { fontSize: 18, fontWeight: "bold" },
  outerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 2,
    backgroundColor: APP_BACKGROUND_COLOR,
    paddingBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    height: "100%",
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  followButton: {
    paddingLeft: 80,
    paddingRight: 10,
    marginBottom: 15,
    alignSelf: "flex-end",
    flex: 1,
  },
  textAndCityMargin: {
    marginBottom: 10,
  },
});
