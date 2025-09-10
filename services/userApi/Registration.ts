// auth
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "@react-native-firebase/auth";
// firestore

import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";

type adultUserProps = {
  role: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  creation_date: Date;
};

type adultRegistrationProps = {
  userInfo: adultUserProps;
};

const adultRegistration = ({ userInfo }: adultRegistrationProps) => {
  registerAdultUser(userInfo);
};

export const registerAdultUser = async (userInfo: adultUserProps) => {
  try {
    const user = await createUserWithEmailAndPassword(
      getAuth(),
      userInfo.email,
      userInfo.password
    );

    await user.user.sendEmailVerification();

    const uid = user.user.uid;

    await saveUserInfo(userInfo, uid);

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

type childUserProps = {
  role: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  password: string;
  profile: string;
  gender: string;
  guardian_id: string | undefined;
  creation_date: Date;
};

export const registerChild = async (userInfo: childUserProps) => {
  try {
    const user = await createUserWithEmailAndPassword(
      getAuth(),
      userInfo.email,
      userInfo.password
    );

    await user.user.sendEmailVerification();

    const uid = user.user.uid;

    await saveUserInfo(userInfo, uid);

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

const saveUserInfo = async (
  userInfo: adultUserProps | childUserProps,
  uid: string
) => {
  const userCollection = firestore().collection("users");

  const { password, ...userWithoutPassword } = userInfo;

  await userCollection.doc(uid).set(userWithoutPassword);

  if (userInfo.role === "Learner") {
    const childUser = userInfo as childUserProps;

    if (childUser.guardian_id) {
      updateChildrenList(uid, childUser.guardian_id);
    }
  } else {
    router.replace(`/screens/${userInfo.role}` as any);
  }
};

const updateChildrenList = async (childId: string, uid: string) => {
  const userCollection = firestore().collection("users");

  await userCollection.doc(uid).update({
    children: firestore.FieldValue.arrayUnion(childId),
  });
};

export default adultRegistration;
