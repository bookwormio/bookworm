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

export const NEW_POST_BOOK_FOLDER = "createbook";
export const NEW_POST_BOOK_SEARCH = "createbooksearch";

export const BLURHASH = "LBN-4dMwIUWC~WRj%M^+-;4n4nWC";

export const BOOKWORM_DARK_GREEN = "rgb(88, 166, 92)";
export const BOOKWORM_LIGHT_GREEN = "#A9CF60";
export const BACKWARDS_PROGRESS_COLOR = "rgb(255, 99, 71)";
export const REMAINING_PROGRESS_COLOR = "rgb(229, 232, 249)";
export const BOOK_WORM_ORANGE = "#FB6D0B";
export const LIGHT_ORANGE = "#FFA669";
export const MEDIUM_ORANGE = "#FF8D40";
export const LIGHT_SALMON = "#FFAA93";
export const DARK_SALMON = "#EE876B";
export const MEDIUM_GREEN = "#84AC38";
export const LIGHT_GOLD = "#FFCC34";
export const DARK_GOLD = "#F6B902";
export const DEEP_BLUE = "#417CE0";
export const LIGHT_BLUE = "#7CA4E9";

export const BORROWING_CHIP_COLORS = [LIGHT_GOLD, DARK_GOLD];

export const CHIP_GRADIENT_COLORS = {
  [ServerBookShelfName.CURRENTLY_READING]: [LIGHT_BLUE, DEEP_BLUE], // #7CA4E9, #417CE0
  [ServerBookShelfName.WANT_TO_READ]: [LIGHT_ORANGE, MEDIUM_ORANGE], // #FFA669, #FF8D40
  [ServerBookShelfName.FINISHED]: [BOOKWORM_LIGHT_GREEN, MEDIUM_GREEN], // #A9CF60, #84AC38
  [ServerBookShelfName.LENDING_LIBRARY]: [LIGHT_SALMON, DARK_SALMON], // #FFAA93, #EE876B
  // TODO: update once we have borrowing library
  // [ServerBookShelfName.BORROWING]: [LIGHT_GOLD, DARK_GOLD],
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
