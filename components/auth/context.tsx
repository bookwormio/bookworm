import { useQuery } from "@tanstack/react-query";
import { useRouter, useSegments } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../../firebase.config";
import { fetchUserData } from "../../services/firebase-services/UserQueries";

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => void;
  createAccount: (email: string, password: string) => void;
  signOut: () => void;
  isLoading: boolean;
  user: User | null;
  setNewUser: (newUser: boolean) => void;
}>({
  signIn: () => null,
  createAccount: () => null,
  signOut: () => null,
  isLoading: false,
  user: null,
  setNewUser: () => null,
});

export function useAuth() {
  return React.useContext(AuthContext);
}

// This hook can be used to access the user info.
function useAuthenticatedRoute(user: User | null, newUser: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const userExists = useQuery({
    queryKey: [],
    queryFn: async () => {
      if (user != null) {
        const userdata = await fetchUserData(user.uid);

        if (userdata != null) {
          return true;
        }
      }
      return false;
    },
  });
  if (typeof userExists === "boolean" && userExists === false) {
    router.replace("/SignIn");
  }

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (user == null && !inAuthGroup) {
      router.replace("/SignIn");
    }
    if (user != null && !newUser && inAuthGroup) {
      router.replace("/posts");
    }
  }, [user, newUser, segments]);
}

interface AuthenticationProviderProps {
  children: React.ReactNode;
}

const AuthenticationProvider = ({ children }: AuthenticationProviderProps) => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setUser] = useState(FIREBASE_AUTH.currentUser);
  const [createUser, setCreateUser] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  useAuthenticatedRoute(currentUser, createUser);

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
          setCreateUser(true);
          createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
            // createUserWithEmailAndPassword return userCredential object as promise resolution
            // user contains info about user account created - uID, email, display Name
            .then(async (userCredential) => {
              const user = userCredential.user;
              setUser(user);
              setLoading(false);
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
        setNewUser: (newUser: boolean) => {
          setCreateUser(newUser);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthenticationProvider };
