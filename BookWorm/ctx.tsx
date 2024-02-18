import { FIREBASE_AUTH } from "./firebase.config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { useStorageState } from "./useStorageState";
import React from "react";

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => void;
  createAccount: (email: string, password: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  user: User | null;
}>({
  signIn: () => null,
  createAccount: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  user: null,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (value == null) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: (email: string, password: string) => {
          signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then(() => {
              setSession("xxx");
            })
            .catch((error) => {
              alert(error);
            });
        },
        createAccount: (email: string, password: string) => {
          createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then(() => {
              setSession("xxx");
            })
            .catch((error) => {
              alert(error);
            });
        },
        signOut: () => {
          FIREBASE_AUTH.signOut()
            .then(() => {
              setSession(null);
            })
            .catch((error) => {
              alert(error);
            });
        },
        session,
        isLoading,
        user: FIREBASE_AUTH.currentUser,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
