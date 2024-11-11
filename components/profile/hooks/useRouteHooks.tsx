import { useRouter, useSegments } from "expo-router";
import {
  POSTS_BOOK_PREFIX,
  POSTS_FOLLOWLIST_PREFIX,
  POSTS_POST_PREFIX,
  POSTS_ROUTE_PREFIX,
  PROFILE_BOOK_PREFIX,
  PROFILE_FOLLOWLIST_PREFIX,
  PROFILE_POST_PREFIX,
  PROFILE_ROUTE_PREFIX,
  SEARCH_BOOK_PREFIX,
  SEARCH_FOLLOWLIST_PREFIX,
  SEARCH_POST_PREFIX,
  SEARCH_RECOMMENDATION_PREFIX,
  SEARCH_ROUTE_PREFIX,
} from "../../../constants/constants";
import {
  generateBookRoute,
  generateFollowListRoute,
  generatePostRoute,
  generateRecommendationRoute,
  generateUserRoute,
} from "../../../utilities/routeUtils";

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
 * Hook to get the current book route info based on URL segments.
 * @returns {RouteInfo} - Object containing the route type and prefix for books.
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
 * Hook to navigate to a book detail page using the provided book ID.
 * @param {string} [bookID] - The ID of the book to navigate to.
 * @returns {Function} - Function to navigate to the book page.
 */
export const useNavigateToBook = (bookID?: string) => {
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

const USER_ROUTE_PREFIXES = {
  SEARCH: SEARCH_ROUTE_PREFIX,
  POSTS: POSTS_ROUTE_PREFIX,
  PROFILE: PROFILE_ROUTE_PREFIX,
} as const;

type UserRouteType = keyof typeof USER_ROUTE_PREFIXES;

interface UserRouteInfo {
  type: UserRouteType | null;
  prefix: string;
}

/**
 * Hook to get the current user route info based on URL segments.
 * @returns {UserRouteInfo} - Object containing the route type and prefix for users.
 */
export const useUserRouteInfo = (): UserRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: USER_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: USER_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: USER_ROUTE_PREFIXES.PROFILE };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a user detail page using the provided user and friend IDs.
 * @param {string} [userID] - The ID of the current user.
 * @param {string} [friendID] - The ID of the user to navigate to.
 * @returns {Function} - Function to navigate to the user page.
 */
export const useNavigateToUser = (userID?: string, friendID?: string) => {
  const router = useRouter();
  const { prefix } = useUserRouteInfo();

  function navigateToUser() {
    const userRoute = generateUserRoute(userID, friendID, prefix);
    if (userRoute != null) {
      router.push(userRoute);
    }
  }
  return navigateToUser;
};

const POST_ROUTE_PREFIXES = {
  SEARCH: SEARCH_POST_PREFIX,
  POSTS: POSTS_POST_PREFIX,
  PROFILE: PROFILE_POST_PREFIX,
} as const;

type PostRouteType = keyof typeof POST_ROUTE_PREFIXES;

interface PostRouteInfo {
  type: PostRouteType | null;
  prefix: string;
}

/**
 * Hook to get the current post route info based on URL segments.
 * @returns {PostRouteInfo} - Object containing the route type and prefix for posts.
 */
export const usePostRouteInfo = (): PostRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: POST_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: POST_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: POST_ROUTE_PREFIXES.PROFILE };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a post detail page using the provided post ID.
 * @param {string} [postID] - The ID of the post to navigate to.
 * @returns {Function} - Function to navigate to the post page.
 */
export const useNavigateToPost = () => {
  const router = useRouter();
  const { prefix } = usePostRouteInfo();

  function navigateToPost(postID?: string) {
    const postRoute = generatePostRoute(postID, prefix);
    if (postRoute != null) {
      router.push(postRoute);
    }
  }

  return navigateToPost;
};

const FOLLOWLIST_ROUTE_PREFIXES = {
  SEARCH: SEARCH_FOLLOWLIST_PREFIX,
  POSTS: POSTS_FOLLOWLIST_PREFIX,
  PROFILE: PROFILE_FOLLOWLIST_PREFIX,
} as const;

type FollowListRouteType = keyof typeof FOLLOWLIST_ROUTE_PREFIXES;

interface FollowListRouteInfo {
  type: FollowListRouteType | null;
  prefix: string;
}

/**
 * Hook to get the current follow list route info based on URL segments.
 * @returns {FollowListRouteInfo} - Object containing the route type and prefix for follow lists.
 */
export const useFollowListRouteInfo = (): FollowListRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: FOLLOWLIST_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: FOLLOWLIST_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: FOLLOWLIST_ROUTE_PREFIXES.PROFILE };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a follow list page for a given user.
 * @param {string} [userID] - The ID of the user whose follow list is being navigated to.
 * @param {boolean} [followersfirst] - If true, navigates to followers list first.
 * @returns {Function} - Function to navigate to the follow list page.
 */
export const useNavigateToFollowList = (userID?: string) => {
  const router = useRouter();
  const { prefix } = useFollowListRouteInfo();

  function navigateToFollowList(followersfirst?: boolean) {
    const followListRoute = generateFollowListRoute(
      userID,
      followersfirst,
      prefix,
    );
    if (followListRoute != null) {
      router.push(followListRoute);
    }
  }

  return navigateToFollowList;
};

const RECOMMENDATION_ROUTE_PREFIXES = {
  SEARCH: SEARCH_RECOMMENDATION_PREFIX,
} as const;

type RecommendationRouteType = keyof typeof RECOMMENDATION_ROUTE_PREFIXES;

interface RecommendationRouteInfo {
  type: RecommendationRouteType | null;
  prefix: string;
}

export const useRecommendationRouteInfo = (): RecommendationRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: RECOMMENDATION_ROUTE_PREFIXES.SEARCH };

  return { type: null, prefix: "" };
};

export const useNavigateToRecommendation = (friendUserID: string) => {
  const router = useRouter();
  const { prefix } = useRecommendationRouteInfo();

  function navigateToRecommendation() {
    if (friendUserID != null && friendUserID !== "") {
      const recommendationRoute = generateRecommendationRoute(
        friendUserID,
        prefix,
      );
      if (recommendationRoute != null) {
        router.push(recommendationRoute);
      }
    }
  }
  return navigateToRecommendation;
};
