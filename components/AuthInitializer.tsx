import { getUserInfo } from "@/services/userApi/Authentication";
import { useAuthStore } from "@/stores/userAuthStore";
import auth from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((state) => state.login);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onFinishHydration(() => {
      const unsubcribe = auth().onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getUserInfo(firebaseUser.uid);

          if (userDoc) {
            setUser({
              fname: userDoc.first_name,
              lname: userDoc.last_name,
              email: userDoc.email,
              phoneNumber: userDoc.phone_number,
              role: userDoc.role,
              uid: firebaseUser.uid,
            });
          }
        } else {
          setUser(null);
        }

        setAuthInitialized(true);
      });

      return () => unsubcribe();
    });

    return () => unsubHydrate();
  }, []);

  if (!authInitialized) return null;
  return children;
};

export default AuthInitializer;
