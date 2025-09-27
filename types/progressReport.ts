import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Progress = {
  id?: string;
  progress_of_learner_id: string;
  start_date: Date | FirebaseFirestoreTypes.Timestamp;
  end_date: Date | FirebaseFirestoreTypes.Timestamp;
  teachers_remarks: string;
  report_title: string;
  teacher_id: string | undefined;
  teacher_last_name: string | undefined;
  teacher_first_name: string | undefined;
};
