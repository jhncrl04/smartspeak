// auth
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "@react-native-firebase/auth";
// firestore

import firestore from "@react-native-firebase/firestore";

type userInfoProps = {
  role: string;
  fname: string;
  lname: string;
  phoneNum: string;
  email: string;
  password: string;
};

type NonLearnerRegistrationProps = {
  userInfo: userInfoProps;
};

const NonLearnerRegistration = ({ userInfo }: NonLearnerRegistrationProps) => {
  registerUser(userInfo);
};

export const registerUser = async (userInfo: userInfoProps) => {
  try {
    const user = await createUserWithEmailAndPassword(
      getAuth(),
      userInfo.email,
      userInfo.password
    );

    await user.user.sendEmailVerification(); // ✅ fixed

    const uid = user.user.uid;

    await saveUserInfo(userInfo, uid); // ✅ still save their info

    return true;
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      console.log("That email address is already in use!");
    }

    if (err.code === "auth/invalid-email") {
      console.log("That email address is invalid!");
    }

    console.error(err);
    return false;
  }
};

const saveUserInfo = async (userInfo: userInfoProps, uid: string) => {
  const userCollection = firestore().collection("users");

  const user = {
    fname: userInfo.fname,
    lname: userInfo.lname,
    email: userInfo.email,
    phoneNumber: userInfo.phoneNum,
    role: userInfo.role,
  };

  await userCollection.doc(uid).set(user);
};

export default NonLearnerRegistration;
