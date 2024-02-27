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
// called by AuthenticationProvider
function useAuthenticatedRoute(user: User | null) {
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    // segments allow you to accesss current route segments
    const inAuthGroup = segments[0] === "(auth)";
    // redirects to sign in page if user DNE
    if (user == null && !inAuthGroup) {
      // replaces path
      router.replace("/sign-in");
      // redirects to post page if user exists
    } else if (user != null && inAuthGroup) {
      // replaces path
      router.replace("/posts");
    }
  }, [user, segments]);
}

// this is what __layout is calling
// props: React.PropsWithChildren allows the Authentication provider component to render and accept any children components passed to it.
export function AuthenticationProvider(props: React.PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  // currentUser is built into FIREBASE_AUTH and is a refernece to current authenticated user
  const [currentUser, setUser] = useState(FIREBASE_AUTH.currentUser);
  // allows you to modify a variable that exists outside of function scope
  // modifies state of external system
  // triggering ui updates
  // any interaction with global environment
  useEffect(() => {
    setLoading(true);
    // listens for change in authentication user
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    // listener is returned from useEffect to ensure that listener is removed when component no longer in use
    return unsubscribe;
  }, []);
  useAuthenticatedRoute(currentUser);

  return (
    // this code sets up an authentication context using React's Context API, providing authentication-related functions and data to all components within its subtree.
    // wraps children components accessed via props.children and passes down a 'value' prop, which contains various authentication-related functions and data
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
