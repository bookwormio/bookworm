import {
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";

import {
  type BookRequestNotificationStatus,
  type ServerBadgeName,
  type ServerBookBorrowStatus,
  type ServerBookShelfName,
  type ServerNotificationType,
} from "../enums/Enums";

interface LineDataPointModel {
  x: number; // time in seconds
  y: number; // pages or minutes
}

interface WeekDataPointModel {
  x: Date; // time as week
  y: number;
}
interface UserSearchDisplayModel {
  id: string;
  firstName: string;
  lastName: string;
}

interface UserDataModel {
  id: string;
  username: string;
  email: string;
  first: string;
  last: string;
  number: string;
  isPublic: boolean;
  bio: string;
  city: string;
  state: string;
  profilepic: string;
}

interface CreatePostModel {
  userid: string;
  bookid: string;
  booktitle: string; // TODO: Potentially remove
  text: string;
  images: string[];
  oldBookmark?: number;
  newBookmark?: number;
  totalPages?: number;
}

interface ConnectionModel {
  currentUserID: string;
  friendUserID: string;
}

// TODO: separate book volume info from book preview info
// (less information needed for a book preview)
interface BookVolumeInfo {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  maturityRating?: string;
  previewLink?: string;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  mainCategory?: string;

  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };

  // TODO: Add more properties as needed
}

interface BookVolumeItem {
  kind?: string;
  id: string;
  etag?: string;
  selfLink?: string;
  volumeInfo: BookVolumeInfo;
  bookShelf?: ServerBookShelfName;
}

interface BooksResponse {
  kind: string;
  items: BookVolumeItem[];
  totalItems: number;
}

interface PostModel {
  id: string;
  bookid: string;
  booktitle: string;
  created: Timestamp;
  text: string;
  user: UserModel;
  images: JSX.Element[];
  likes: string[];
  comments: CommentModel[];
  oldBookmark?: number;
  newBookmark?: number;
  totalPages?: number;
}

interface CommentModel {
  userID: string;
  first: string;
  text: string;
}

interface RelationshipModel {
  id: string;
  created_at: Timestamp;
  follow_status: string;
  follower: string;
  following: string;
  updated_at: Timestamp;
}

interface UserModel {
  id: string;
  email: string;
  first: string;
  isPublic: boolean;
  last: string;
  number: Timestamp;
}

interface CreateTrackingModel {
  userid: string;
  pagesRead: number;
  minutesRead: number;
}

interface PostPaginationModel {
  userid: string;
  lastVisiblePage: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}

interface FlatBookItemModel {
  id: string;
  title: string;
  image: string;
  author: string;
  pageCount?: number;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  categories?: string[];
  maturityRating?: string;
  previewLink?: string;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  mainCategory?: string;
}

interface BookShelfBookModel {
  id: string;
  created: Timestamp;
  volumeInfo: BookshelfVolumeInfo;
}

interface BookshelfVolumeInfo {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  maturityRating?: string;
  previewLink?: string;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  mainCategory?: string;
  thumbnail?: string;
}

interface BookmarkModel {
  bookmark: number;
  created: Timestamp;
  updated: Timestamp;
}

type UserBookShelvesModel = Record<string, BookShelfBookModel[]>;

interface BasicNotificationModel {
  receiver: string;
  sender: string;
  sender_name: string;
}

interface FullNotificationModel {
  notifID: string;
  receiver: string;
  comment?: string;
  sender: string;
  sender_name: string;
  created: Timestamp;
  read_at: Timestamp | null;
  postID?: string;
  bookID?: string;
  bookTitle?: string;
  custom_message?: string;
  bookRequestStatus?: BookRequestNotificationStatus;
  type: ServerNotificationType;
}

interface FriendRequestNotification extends BasicNotificationModel {
  type: ServerNotificationType.FRIEND_REQUEST;
}

interface LikeNotification extends BasicNotificationModel {
  type: ServerNotificationType.LIKE;
  postID: string;
}

interface CommentNotification extends BasicNotificationModel {
  type: ServerNotificationType.COMMENT;
  postID: string;
  comment: string;
}

interface RecommendationNotification extends BasicNotificationModel {
  type: ServerNotificationType.RECOMMENDATION;
  bookID: string;
  bookTitle: string;
  custom_message: string;
}

interface BookRequestNotification extends BasicNotificationModel {
  type: ServerNotificationType.BOOK_REQUEST;
  bookID: string;
  bookTitle: string;
  custom_message: string;
  bookRequestStatus: BookRequestNotificationStatus;
}

interface BookRequestResponseNotification extends BasicNotificationModel {
  type: ServerNotificationType.BOOK_REQUEST_RESPONSE;
  bookID: string;
  bookTitle: string;
  custom_message: string;
  bookRequestStatus?: BookRequestNotificationStatus;
}

type NotificationModel =
  | FriendRequestNotification
  | LikeNotification
  | CommentNotification
  | RecommendationNotification
  | BookRequestNotification
  | BookRequestAcceptedNotification
  | BookRequestDeniedNotification;

interface BookBorrowModel {
  bookID: string;
  lendingUserID: string;
  borrowingUserID: string;
  borrowStatus: ServerBookBorrowStatus;
}
interface BookStatusModel {
  borrowInfo?: BookBorrowModel;
  requestStatus?: BookRequestNotificationStatus;
}

interface UpdateBorrowNotificationParams {
  notifID: string;
  newStatus: BookRequestNotificationStatus;
  userID: string;
}

interface DenyOtherBorrowRequestsParams {
  lenderUserID: string;
  acceptedBorrowerUserID: string;
  acceptedBorrowerUserName: string;
  bookID: string;
}

interface BadgeModel {
  userID: string;
  badgeID: ServerBadgeName;
}
