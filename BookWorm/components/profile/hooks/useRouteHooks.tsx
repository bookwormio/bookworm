import { useRouter, useSegments } from "expo-router";
import {
  POSTS_BOOK_PREFIX,
  POSTS_ROUTE_PREFIX,
  PROFILE_BOOK_PREFIX,
  PROFILE_ROUTE_PREFIX,
  SEARCH_BOOK_PREFIX,
  SEARCH_ROUTE_PREFIX,
} from "../../../constants/constants";
import { generateBookRoute } from "../../../utilities/routeUtils";

const BOOK_ROUTE_PREFIXES = {
  SEARCH: SEARCH_BOOK_PREFIX,
  POSTS: POSTS_BOOK_PREFIX,
  PROFILE: PROFILE_BOOK_PREFIX,
} as const;

type RouteType = keyof typeof BOOK_ROUTE_PREFIXES;

interface RouteInfo {
  type: RouteType | null;
  prefix: string;
}

/**
 * Hook to get the route information for the current book route.
 * @returns The route information
 */
export const useBookRouteInfo = (): RouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: BOOK_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: BOOK_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: BOOK_ROUTE_PREFIXES.PROFILE };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a book based on the book ID.
 * @param bookID - The ID of the book
 * @returns The function to navigate to the book
 */
export const useNavigateToBook = (bookID: string) => {
  const router = useRouter();
  const { prefix } = useBookRouteInfo();

  function navigateToBook() {
    const bookRoute = generateBookRoute(bookID, prefix);
    if (bookRoute != null) {
      router.push(bookRoute);
    }
  }

  return navigateToBook;
};
