import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { type FlatBookItemModel } from "../../../types";

/**
 * Context for the NewPostBookSelect component
 * This is so the selected book can be shared
 * between the NewPostBookSelect and NewPost
 */
const NewPostContext = createContext<{
  selectedBook: FlatBookItemModel | null;
  setSelectedBook: (val: FlatBookItemModel | null) => void;
}>({
  selectedBook: null,
  setSelectedBook: () => {},
});

export function useNewPostContext() {
  return useContext(NewPostContext);
}

interface NewPostProviderProps {
  children: ReactNode;
}

const NewPostProvider = ({ children }: NewPostProviderProps) => {
  const [selectedBook, setSelectedBook] = useState<FlatBookItemModel | null>(
    null,
  );

  return (
    <NewPostContext.Provider value={{ selectedBook, setSelectedBook }}>
      {children}
    </NewPostContext.Provider>
  );
};

export { NewPostProvider };
