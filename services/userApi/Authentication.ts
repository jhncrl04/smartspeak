import { useAuthStore } from "@/stores/userAuthStore";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type userProps = { email: string; password: string };

export const loginAuth = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );

    const user = userCredential.user;
    const userDoc = await getUserInfo(user.uid);

    return [user, userDoc];
  } catch (err) {
    console.error(`Login Error: ${err}`);

    return null;
  }
};

export const getUserInfo = async (uid: string) => {
  const doc = await firestore().collection("users").doc(uid).get();

  return doc.data();
};

export const initAuthListener = () => {
  auth().onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // 🔑 Fetch user profile from Firestore
        const userDoc = await firestore()
          .collection("users")
          .doc(firebaseUser.uid)
          .get();

        const userData = userDoc.data();

        if (!userData) {
          console.warn(
            "User document not found in Firestore for uid:",
            firebaseUser.uid
          );
          useAuthStore.setState({ user: null });

          return;
        }

        const mappedUser = {
          fname: userData.fname ?? "",
          lname: userData.lname ?? "",
          email: firebaseUser.email ?? "",
          phoneNumber: firebaseUser.phoneNumber ?? "",
          role: userData.role ?? "user",
          uid: firebaseUser.uid,
        };

        useAuthStore.setState({ user: mappedUser });
      } catch (error) {
        console.error("Error fetching user from Firestore:", error);
        useAuthStore.setState({ user: null });
      }
    } else {
      useAuthStore.setState({ user: null });
    }
  });
};
