import {
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";

import { type ServerNotificationType } from "../enums/Enums";

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
  profilePicURL: string;
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
  title: string;
  subtitle: string;
  authors: string[];
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

  imageLinks: {
    smallThumbnail: string;
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    extraLarge: string;
  };

  // TODO: Add more properties as needed
}

interface BookVolumeItem {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: BookVolumeInfo;
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
  // TODO change this to use new expo images
  image: string;
  author: string;
  pageCount?: number;
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

type UserBookShelvesModel = Record<string, BookShelfBookModel[]>;

interface BasicNotificationModel {
  receiver: string;
  sender: string;
  sender_name: string;
  sender_img: string;
  comment: string;
  postID: string;
  type: ServerNotificationType;
}

interface FullNotificationModel {
  receiver: string;
  message: string;
  comment: string;
  sender: string;
  sender_name: string;
  sender_img: string;
  created: Timestamp;
  read_at: Timestamp;
  postID: string;
  type: ServerNotificationType;
}
