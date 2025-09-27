import getCurrentUid from "@/helper/getCurrentUid";
import { useAuthStore } from "@/stores/userAuthStore";
import { Progress } from "@/types/progressReport";
import firestore from "@react-native-firebase/firestore";

const progressReportCollection = firestore().collection("progressReports");

export const submitStudentProgressReport = (report: Progress) => {
  try {
    progressReportCollection.add(report);
  } catch (err) {
    console.error(err);
  }
};

export const fetchReportsForStudent = async (studentId: string) => {
  try {
    const uid = getCurrentUid();

    const user = useAuthStore.getState().user;

    const reportSnapshot =
      user?.role.toLowerCase() === "teacher"
        ? await progressReportCollection
            .where("teacher_id", "==", uid)
            .where("progress_of_learner_id", "==", studentId)
            .get()
        : await progressReportCollection
            .where("progress_of_learner_id", "==", studentId)
            .get();

    const reports: Progress[] = reportSnapshot.docs.map((doc) => {
      const report = doc.data() as Progress;
      report.id = doc.id;

      return report;
    });

    return reports;
  } catch (err) {
    console.error(err);
  }
};
