import { type ImageStyle, type StyleProp } from "react-native";
import { ServerBookShelfName } from "../enums/Enums";

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTHS_OF_YEAR = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const HOURS = Array.from({ length: 23 }, (_, index) => ({
  label: (index + 1).toString(),
  value: (index + 1).toString(),
}));

export const MINUTES = Array.from({ length: 11 }, (_, index) => ({
  label: ((index + 1) * 5).toString(),
  value: ((index + 1) * 5).toString(),
}));

export const POSTS_ROUTE_PREFIX: string = "(posts)";
export const SEARCH_ROUTE_PREFIX: string = "(search)";
export const PROFILE_ROUTE_PREFIX: string = "(profile)";

export const PROFILE_BOOK_PREFIX: string = "profilebook";
export const POSTS_BOOK_PREFIX: string = "postsbook";
export const SEARCH_BOOK_PREFIX: string = "searchbook";
export const PROFILE_FOLLOW_PREFIX: string = "follow";

export const PROFILE_POST_PREFIX: string = "profilepost";
export const SEARCH_POST_PREFIX: string = "posts";
export const POSTS_POST_PREFIX: string = "viewposts";

export const PROFILE_FOLLOWLIST_PREFIX: string = "profilefollow";
export const SEARCH_FOLLOWLIST_PREFIX: string = "searchfollow";
export const POSTS_FOLLOWLIST_PREFIX: string = "postsfollow";

export const NEW_POST_BOOK_FOLDER = "createbook";
export const NEW_POST_BOOK_SEARCH = "createbooksearch";

export const SEARCH_RECOMMENDATION_PREFIX = "recommendation";

export const BLURHASH = "LBN-4dMwIUWC~WRj%M^+-;4n4nWC";

export const FIRST_PROGRESS_COLOR = "rgb(88, 166, 92)";
export const BOOKWORM_LIGHT_GREEN = "#A9CF60";
export const BACKWARDS_PROGRESS_COLOR = "rgb(255, 99, 71)";
export const REMAINING_PROGRESS_COLOR = "rgb(229, 232, 249)";
export const VIOLET = "#7CA4E9";
export const LIGHT_ORANGE = "#FF9E5B";
export const SALMON = "#FFAA93";

export const BOOKSHELF_CHIP_COLORS = {
  [ServerBookShelfName.CURRENTLY_READING]: VIOLET, // #7CA4E9
  [ServerBookShelfName.WANT_TO_READ]: LIGHT_ORANGE, // #FF9E5B
  [ServerBookShelfName.FINISHED]: BOOKWORM_LIGHT_GREEN, // #A9CF60
  [ServerBookShelfName.LENDING_LIBRARY]: SALMON, // #FFAA93
};

export const POST_IMAGE_HEIGHT = 250;
export const POST_IMAGE_WIDTH = 250;
export const POST_IMAGE_BORDER_RADIUS = 3;
export const IMG_STYLE: StyleProp<ImageStyle> = {
  height: POST_IMAGE_HEIGHT,
  width: POST_IMAGE_WIDTH,
  borderRadius: POST_IMAGE_BORDER_RADIUS,
  marginRight: 10,
};

export const FIRST_IMAGE_HEIGHT = 250;
export const FIRST_IMAGE_WIDTH = 180;
export const FIRST_IMAGE_BORDER_RADIUS = 3;
export const FIRST_IMG_STYLE: StyleProp<ImageStyle> = {
  height: FIRST_IMAGE_HEIGHT,
  width: FIRST_IMAGE_WIDTH,
  borderRadius: FIRST_IMAGE_BORDER_RADIUS,
  marginRight: 0,
};

export const APP_BACKGROUND_COLOR = "white";

export const BORROW_BOOK_COLLECTION_REF = "borrowing_collection";

export const BOOK_AUTO_DENIAL_NOTIFICATION_MESSAGE =
  "This book is being lent to someone else.";

export const MAX_PREFETCH_USERS = 10;
