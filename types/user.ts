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

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: FirebaseFirestoreTypes.Timestamp | Date | null;
  profile_pic: string;
  gender?: string;
  phone_number?: string;
  region: string | null;
  region_name: string | null;
  province: string | null;
  province_name: string | null;
  municipality: string | null;
  municipality_name: string | null;
  barangay: string | null;
  barangay_name: string | null;
};
