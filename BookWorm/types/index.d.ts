import { type Timestamp } from "firebase/firestore";

interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
}

interface UserData {
  id: string;
  email: string;
  first: string;
  isPublic: boolean;
  last: string;
  number: string;
}

interface Post {
  userid: string;
  book: stirng;
  text: string;
  imageURI: string;
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
  book: string;
  created: Timestamp;
  text: string;
  user: UserModel;
  images: string[] | null;
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
