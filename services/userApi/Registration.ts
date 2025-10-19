// auth
import { showToast } from "@/components/ui/MyToast";
import { useAuthStore } from "@/stores/userAuthStore";
import { getFriendlyRegistrationError } from "@/utils/firebaseError";
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
  created_at: Date;
  acct_status?: string;
  region: string;
  region_name: string;
  province: string;
  province_name: string;
  municipality: string;
  municipality_name: string;
  barangay: string;
  barangay_name: string;
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
    console.error(err);

    console.error("Login Error:", err);

    const errorCode = (err.code as string) || "unknown";

    const friendlyMessage = getFriendlyRegistrationError(errorCode);

    showToast("error", "Login Failed", friendlyMessage);

    return false;
  }
};

type childUserProps = {
  role: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  email: string;
  password: string;
  profile_pic: string;
  gender: string;
  guardian_id: string | undefined;
  created_at: Date;
  acct_status?: string;
  region: string;
  region_name: string;
  province: string;
  province_name: string;
  municipality: string;
  municipality_name: string;
  barangay: string;
  barangay_name: string;
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

    console.error("Login Error:", err);

    const errorCode = (err.code as string) || "unknown";

    const friendlyMessage = getFriendlyRegistrationError(errorCode);

    // showToast("error", "Login Failed", friendlyMessage);

    return friendlyMessage;
  }
};

const saveUserInfo = async (
  userInfo: adultUserProps | childUserProps,
  uid: string
) => {
  const userCollection = firestore().collection("users");

  const { password, ...userWithoutPassword } = userInfo;
  userWithoutPassword.email = userWithoutPassword.email.toLowerCase();
  userWithoutPassword.acct_status = "ACTIVE";

  await userCollection.doc(uid).set(userWithoutPassword);

  if (userInfo.role === "Learner") {
    const childUser = userInfo as childUserProps;

    if (childUser.guardian_id) {
      updateChildrenList(uid, childUser.guardian_id);
    }
  } else {
    router.replace(`/accountVerification`);
  }
};

const updateChildrenList = async (childId: string, uid: string) => {
  try {
    const userCollection = firestore().collection("users");

    // Update Firestore - add child ID to children array
    await userCollection.doc(uid).update({
      children: firestore.FieldValue.arrayUnion(childId),
    });

    // Update Zustand store - append to handledChildren
    const currentUser = useAuthStore.getState().user;

    if (currentUser) {
      const updatedChildren = currentUser.handledChildren
        ? [...currentUser.handledChildren, childId]
        : [childId];

      useAuthStore.getState().updateUser({
        handledChildren: updatedChildren,
      });
    }

    console.log("Child added successfully to parent's list");
  } catch (error) {
    console.error("Error updating children list:", error);
    throw error;
  }
};

export default adultRegistration;
