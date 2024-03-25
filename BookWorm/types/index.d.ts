interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
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
