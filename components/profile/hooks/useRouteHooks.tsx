import { useRouter, useSegments } from "expo-router";
import {
  POSTS_BADGE_PREFIX,
  POSTS_BOOK_PREFIX,
  POSTS_BOOKLIST_PREFIX,
  POSTS_FOLLOWLIST_PREFIX,
  POSTS_IMAGEBLOWUP_PREFIX,
  POSTS_POST_PREFIX,
  POSTS_RECOMMENDATION_PREFIX,
  POSTS_ROUTE_PREFIX,
  PROFILE_BADGE_PREFIX,
  PROFILE_BOOK_PREFIX,
  PROFILE_BOOKLIST_PREFIX,
  PROFILE_FOLLOWLIST_PREFIX,
  PROFILE_IMAGEBLOWUP_PREFIX,
  PROFILE_POST_PREFIX,
  PROFILE_RECOMMENDATION_PREFIX,
  PROFILE_ROUTE_PREFIX,
  SEARCH_BOOK_PREFIX,
  SEARCH_BOOKLIST_PREFIX,
  SEARCH_FOLLOWLIST_PREFIX,
  SEARCH_IMAGEBLOWUP_PREFIX,
  SEARCH_POST_PREFIX,
  SEARCH_RECOMMENDATION_PREFIX,
  SEARCH_ROUTE_PREFIX,
} from "../../../constants/constants";
import {
  generateBadgePageRoute,
  generateBookListRoute,
  generateBookRoute,
  generateFollowListRoute,
  generateImageBlowupRoute,
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
export const useNavigateToUser = () => {
  const router = useRouter();
  const { prefix } = useUserRouteInfo();

  function navigateToUser(userID?: string, friendID?: string) {
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
  POSTS: POSTS_RECOMMENDATION_PREFIX,
  PROFILE: PROFILE_RECOMMENDATION_PREFIX,
} as const;

type RecommendationRouteType = keyof typeof RECOMMENDATION_ROUTE_PREFIXES;

interface RecommendationRouteInfo {
  type: RecommendationRouteType | null;
  prefix: string;
}

/**
 * Hook to get the recommendation page route info based on URL segments.
 * @returns {RecommendationRouteInfo} - Object containing the route type and prefix for the recommendation page.
 */
export const useRecommendationRouteInfo = (): RecommendationRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: RECOMMENDATION_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: RECOMMENDATION_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: RECOMMENDATION_ROUTE_PREFIXES.PROFILE };
  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a recommendation page for a given user.
 * @param {string} [friendUserID] - The ID of the user whose recommendation page is being navigated to.
 * @returns {Function} - Function to navigate to the recommendation page.
 */
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

const BADGE_ROUTE_PREFIXES = {
  PROFILE: PROFILE_BADGE_PREFIX,
  POSTS: POSTS_BADGE_PREFIX,
} as const;

type BadgeRouteType = keyof typeof BADGE_ROUTE_PREFIXES;

interface BadgeRouteInfo {
  type: BadgeRouteType | null;
  prefix: string;
}

/**
 * Hook to get the current badges route info based on URL segments.
 * @returns {BadgeRouteInfo} - Object containing the route type and prefix for badges.
 */
export const useBadgePageRouteInfo = (): BadgeRouteInfo => {
  const segments = useSegments();

  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: BADGE_ROUTE_PREFIXES.PROFILE };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: BADGE_ROUTE_PREFIXES.POSTS };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a badge page for a given user.
 * @param {string} [userID] - The ID of the user whose badge page is being navigated to.
 * @returns {Function} - Function to navigate to the badge page.
 */
export const useNavigateToBadgePage = (userID: string) => {
  const router = useRouter();
  const { prefix } = useBadgePageRouteInfo();

  function navigateToBadgePage() {
    if (userID != null && userID !== "") {
      const badgeRoute = generateBadgePageRoute(userID, prefix);
      if (badgeRoute != null) {
        router.push(badgeRoute);
      }
    }
  }
  return navigateToBadgePage;
};

const BOOKLIST_ROUTE_PREFIXES = {
  SEARCH: SEARCH_BOOKLIST_PREFIX,
  POSTS: POSTS_BOOKLIST_PREFIX,
  PROFILE: PROFILE_BOOKLIST_PREFIX,
} as const;

type BookListRouteType = keyof typeof BOOKLIST_ROUTE_PREFIXES;

interface FollowListRouteInfo {
  type: BookListRouteType | null;
  prefix: string;
}

/**
 * Hook to get the current book list route info based on URL segments.
 * @returns {FollowListRouteInfo} - Object containing the route type and prefix for book lists.
 */
export const useBookListRouteInfo = (): FollowListRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: BOOKLIST_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: BOOKLIST_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: BOOKLIST_ROUTE_PREFIXES.PROFILE };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a book list page for a given user.
 * @param {string} [userID] - The ID of the user whose book list is being navigated to.
 * @returns {Function} - Function to navigate to the book list page.
 */
export const useNavigateToBookList = (userID: string) => {
  const router = useRouter();
  const { prefix } = useBookListRouteInfo();

  function navigateToBookList(bookshelf: string) {
    const bookListRoute = generateBookListRoute(userID, bookshelf, prefix);
    if (bookListRoute != null) {
      router.push(bookListRoute);
    }
  }

  return navigateToBookList;
};

const IMAGE_BLOWUP_ROUTE_PREFIXES = {
  POSTS: POSTS_IMAGEBLOWUP_PREFIX,
  PROFILE: PROFILE_IMAGEBLOWUP_PREFIX,
  SEARCH: SEARCH_IMAGEBLOWUP_PREFIX,
} as const;

type ImageBlowupRouteType = keyof typeof IMAGE_BLOWUP_ROUTE_PREFIXES;

interface ImageBlowupRouteInfo {
  type: ImageBlowupRouteType | null;
  prefix: string;
}

/**
 * Hook to get the image blowup route info based on URL segments.
 * @returns {ImageBlowupRouteInfo} - Object containing the route type and prefix for image blowup.
 */
export const useImageBlowupRouteInfo = (): ImageBlowupRouteInfo => {
  const segments = useSegments();

  if (segments.includes(SEARCH_ROUTE_PREFIX))
    return { type: "SEARCH", prefix: IMAGE_BLOWUP_ROUTE_PREFIXES.SEARCH };
  if (segments.includes(POSTS_ROUTE_PREFIX))
    return { type: "POSTS", prefix: IMAGE_BLOWUP_ROUTE_PREFIXES.POSTS };
  if (segments.includes(PROFILE_ROUTE_PREFIX))
    return { type: "PROFILE", prefix: IMAGE_BLOWUP_ROUTE_PREFIXES.PROFILE };

  return { type: null, prefix: "" };
};

/**
 * Hook to navigate to a image blowup for a given image.
 * @param {string} [imageURL] - The url of the image.
 * @returns {Function} - Function to navigate to the image blowup.
 */
export const useNavigateToImageBlowup = () => {
  const router = useRouter();
  const { prefix } = useImageBlowupRouteInfo();

  function navigateToImageBlowup(imageURL: string) {
    const imageBlowupRoute = generateImageBlowupRoute(
      encodeURIComponent(imageURL),
      prefix,
    );
    if (imageBlowupRoute != null) {
      router.push(imageBlowupRoute);
    }
  }

  return navigateToImageBlowup;
};

/**
 * Hook to navigate to the notifications page.
 * @returns {Function} - Function to navigate to the notifications page.
 */
export const useNavigateToNotificationsPage = () => {
  const router = useRouter();
  function navigateToNotificationsPage() {
    router.push("/notifications");
  }
  return navigateToNotificationsPage;
};
