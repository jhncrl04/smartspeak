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

    console.log(user.uid);

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
