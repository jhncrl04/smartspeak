import {
  createUserWithEmailAndPassword,
  getAuth,
} from "@react-native-firebase/auth";
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

export const registerUser = async (user: userInfoProps) => {
  console.log("====================================");
  console.log(user);
  console.log("====================================");

  await createUserWithEmailAndPassword(getAuth(), user.email, user.password)
    .then(() => {
      console.log("User account created & signed in!");
      saveUserInfo(user);

      return true;
    })
    .catch((err) => {
      if (err.code === "auth/email-already-in-use") {
        console.log("That email address is already in use!");
      }

      if (err.code === "auth/invalid-email") {
        console.log("That email addres invalid!");
      }

      console.error(err);

      return false;
    });

  return false;
};

const saveUserInfo = async (userInfo: userInfoProps) => {
  const userCollection = firestore().collection("users");
  const user = {
    fname: userInfo.fname,
    lname: userInfo.lname,
    email: userInfo.email,
    phoneNumber: userInfo.phoneNum,
    role: userInfo.role,
  };

  await userCollection.add(user);
};

export default NonLearnerRegistration;
