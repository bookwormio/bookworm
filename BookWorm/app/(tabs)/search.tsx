import React from "react";
import BookSearch from "../../components/booksearch/booksearch";
import UserSearch from "../../components/usersearch/usersearch";

const isUserSearch = false;

export default function Search() {
  return <>{isUserSearch ? <UserSearch /> : <BookSearch />}</>;
}
