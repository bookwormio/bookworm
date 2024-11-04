import React from "react";
import { Button } from "react-native";
import {
  BOOKSHELF_CHIP_DISPLAY,
  type ServerBookShelfName,
} from "../../enums/Enums";

interface BookshelfListChipProps {
  bookShelf: ServerBookShelfName;
}

const BookshelfListChip = ({ bookShelf }: BookshelfListChipProps) => {
  return <Button title={BOOKSHELF_CHIP_DISPLAY[bookShelf]} disabled={true} />;
};

export default BookshelfListChip;
