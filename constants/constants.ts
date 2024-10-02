import { type ImageStyle, type StyleProp } from "react-native";

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

export const POSTS_ROUTE_PREFIX = "(posts)";
export const SEARCH_ROUTE_PREFIX = "(search)";
export const PROFILE_ROUTE_PREFIX = "(profile)";

export const PROFILE_BOOK_PREFIX = "profilebook";
export const POSTS_BOOK_PREFIX = "postsbook";
export const SEARCH_BOOK_PREFIX = "searchbook";

export const NEW_POST_BOOK_FOLDER = "createbook";
export const NEW_POST_BOOK_SEARCH = "createbooksearch";

export const BLURHASH = "LBN-4dMwIUWC~WRj%M^+-;4n4nWC";

export const FIRST_PROGRESS_COLOR = "rgb(88, 166, 92)";
export const SECOND_PROGRESS_COLOR = "rgb(169, 207, 96)";
export const BACKWARDS_PROGRESS_COLOR = "rgb(255, 99, 71)";
export const REMAINING_PROGRESS_COLOR = "rgb(229, 232, 249)";

export const POST_IMAGE_HEIGHT = 250;
export const POST_IMAGE_WIDTH = 200;
export const POST_IMAGE_BORDER_RADIUS = 3;
export const IMG_STYLE: StyleProp<ImageStyle> = {
  height: POST_IMAGE_HEIGHT,
  width: POST_IMAGE_WIDTH,
  borderRadius: POST_IMAGE_BORDER_RADIUS,
  marginRight: 10,
};

export const APP_BACKGROUND_COLOR = "white";

export const BORROW_BOOK_COLLECTION_REF = "borrowing_collection";
