import { useSegments } from "expo-router";

export const useIsProfileRoute = () => {
  const route = useSegments();
  return route.includes("profile");
};

export const useIsFriendProfileRoute = () => {
  const route = useSegments();
  return route.includes("(search)");
};
