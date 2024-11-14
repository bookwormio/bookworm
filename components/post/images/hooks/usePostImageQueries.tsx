import { useQuery } from "@tanstack/react-query";
import { getDownloadURL, type StorageReference } from "firebase/storage";

export const useGetDownloadURL = (storageRef: StorageReference) => {
  return useQuery({
    queryKey: ["imageDownloadURL", storageRef.fullPath],
    queryFn: async () => {
      return await getDownloadURL(storageRef);
    },
  });
};
