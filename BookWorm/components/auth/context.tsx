import { useRouter, useSegments } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { DB, FIREBASE_AUTH } from "../../firebase.config";

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => void;
  createAccount: (email: string, password: string) => void;
  signOut: () => void;
  isLoading: boolean;
  user: User | null;
}>({
  signIn: () => null,
  createAccount: () => null,
  signOut: () => null,
  isLoading: false,
  user: null,
});

export function useAuth() {
  return React.useContext(AuthContext);
}

// This hook can be used to access the user info.
function useAuthenticatedRoute(user: User | null) {
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (user == null && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (user != null && inAuthGroup) {
      router.replace("/posts");
    }
  }, [user, segments]);
}

export function AuthenticationProvider(props: React.PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  const [currentUser, setUser] = useState(FIREBASE_AUTH.currentUser);
  useEffect(() => {
    setLoading(true);
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  useAuthenticatedRoute(currentUser);

  return (
    <AuthContext.Provider
      value={{
        signIn: (email: string, password: string) => {
          setLoading(true);
          signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then(() => {
              setUser(FIREBASE_AUTH.currentUser);
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
              setUser(user);
              try {
                await setDoc(doc(DB, "user_collection", user.uid), {
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
              setUser(null);
            })
            .catch((error) => {
              alert(error);
            })
            .finally(() => {
              setLoading(false);
            });
        },
        isLoading: loading,
        user: currentUser,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
