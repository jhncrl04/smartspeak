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

export const subscribeToStudentReports = (
  studentId: string,
  onUpdate: (reports: Progress[]) => void,
  onError?: (error: Error) => void
) => {
  const uid = getCurrentUid();
  const user = useAuthStore.getState().user;

  let query = progressReportCollection.where(
    "progress_of_learner_id",
    "==",
    studentId
  );

  // Returns unsubscribe function
  return query.onSnapshot(
    (snapshot) => {
      const reports: Progress[] = snapshot.docs.map((doc) => {
        const report = doc.data() as Progress;
        report.id = doc.id;
        return report;
      });
      onUpdate(reports);
    },
    (error) => {
      console.error("Error fetching reports:", error);
      onError?.(error);
    }
  );
};

// Keep the original function for compatibility
export const fetchReportsForStudent = async (studentId: string) => {
  try {
    const uid = getCurrentUid();
    const user = useAuthStore.getState().user;

    let query = progressReportCollection.where(
      "progress_of_learner_id",
      "==",
      studentId
    );

    if (user?.role.toLowerCase() === "teacher") {
      query = query.where("teacher_id", "==", uid);
    }

    const reportSnapshot = await query.get();

    const reports: Progress[] = reportSnapshot.docs.map((doc) => {
      const report = doc.data() as Progress;
      report.id = doc.id;
      return report;
    });

    return reports;
  } catch (err) {
    console.error(err);
    return [];
  }
};
