import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Learner = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: FirebaseFirestoreTypes.Timestamp | Date | null;
  profile_pic: string;
  gender: string;
};
