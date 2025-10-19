import { showToast } from "@/components/ui/MyToast";
import { getFriendlyAuthError } from "@/utils/firebaseError";
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
  } catch (err: any) {
    console.error("Login Error:", err);

    const errorCode = (err.code as string) || "unknown";

    const friendlyMessage = getFriendlyAuthError(errorCode);

    showToast("error", "Login Failed", friendlyMessage);

    return null;
  }
};

export const getUserInfo = async (uid: string) => {
  const doc = await firestore().collection("users").doc(uid).get();

  return doc.data();
};
