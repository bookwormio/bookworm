import React from "react";
import BookSearch from "../../components/booksearch/booksearch";
import UserSearch from "../../components/usersearch/usersearch";

// TODO: add a tab that allows for switch between user / book search
const isUserSearch = true;

export default function Search() {
  return <>{isUserSearch ? <UserSearch /> : <BookSearch />}</>;
}
