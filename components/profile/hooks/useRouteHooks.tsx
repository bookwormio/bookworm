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
  SEARCH_ROUTE_PREFIX,
} from "../../../constants/constants";
import {
  generateBookRoute,
  generateFollowListRoute,
  generatePostRoute,
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
