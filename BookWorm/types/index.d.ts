import {
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";

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
  profilepic: string;
}

interface CreatePostModel {
  userid: string;
  bookid: string;
  booktitle: string; // TODO: Potentially remove
  text: string;
  images: string[];
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
  averageRating?: string;
  ratingsCount?: string;
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
}
interface BookShelfBookModel {
  id: string;
  created: Timestamp;
  volumeInfo?: BookVolumeInfo; // Optional property for detailed information
}

type UserBookShelvesModel = Record<string, BookShelfBookModel[]>;
