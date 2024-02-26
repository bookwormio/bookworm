import { FIREBASE_AUTH, db } from "./firebase.config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { useStorageState } from "./useStorageState";
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [[isLoading, session], setSession] = useStorageState("session");
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        signIn: (email: string, password: string) => {
          setLoading(true);
          signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then(() => {
              setSession("xxx");
            })
            .catch((error) => {
              alert(error);
            })
            .finally(() => {
              setLoading(false);
            });
        },
        createAccount: (email: string, password: string) => {
          setLoading(true);
          createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
            // createUserWithEmailAndPassword return userCredential object as promise resolution
            // user contains info about user account created - uID, email, display Name
            .then(async (userCredential) => {
              const user = userCredential.user;
              // https://firebase.google.com/docs/firestore/manage-data/add-data#web-modular-api
              setSession("xxx");
              try {
                await setDoc(doc(db, "user_collection", user.uid), {
                  email: user.email,
                });
              } catch (error) {
                alert(error);
              }
            })
            .catch((error) => {
              alert(error);
            })
            .finally(() => {
              setLoading(false);
            });
        },
        signOut: () => {
          setLoading(true);
          FIREBASE_AUTH.signOut()
            .then(() => {
              setSession(null);
            })
            .catch((error) => {
              alert(error);
            })
            .finally(() => {
              setLoading(false);
            });
        },
        session,
        isLoading: loading,
        user: FIREBASE_AUTH.currentUser,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
