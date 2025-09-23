import getCurrentUid from "@/helper/getCurrentUid";
import { useAuthStore } from "@/stores/userAuthStore";
import { GradeAndSection } from "@/types/gradeSection";
import { Learner } from "@/types/user";
import firestore, { arrayUnion } from "@react-native-firebase/firestore";

const sectionCollection = firestore().collection("sections");
const gradeLevelCollection = firestore().collection("gradeLevels");
const usersCollection = firestore().collection("users");

export const getSectionsWithStudents = async () => {
  const uid = getCurrentUid();

  const sectionSnapshot = await sectionCollection
    .where("teachers", "array-contains", uid)
    .get();

  const sections = await Promise.all(
    sectionSnapshot.docs.map(async (sectionDoc) => {
      const sectionData = sectionDoc.data();
      const gradeLevelSnapshot = await gradeLevelCollection
        .doc(sectionData.grade_id)
        .get();

      const gradeLevel = gradeLevelSnapshot.exists()
        ? { id: gradeLevelSnapshot.id, ...(gradeLevelSnapshot.data() as any) }
        : null;

      // fetch student docs
      let learners: Learner[] = [];
      if (sectionData.students?.length) {
        const studentDocs = await Promise.all(
          sectionData.students.map((studentId: string) =>
            usersCollection.doc(studentId).get()
          )
        );
        learners = studentDocs
          .filter((doc) => doc.exists)
          .map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      const formattedSection: GradeAndSection & { learners: Learner[] } = {
        gradeId: gradeLevel?.id,
        gradeName: gradeLevel?.name,
        sectionId: sectionDoc.id,
        sectionName: sectionData.name,
        learners,
      };

      return formattedSection;
    })
  );

  return sections;
};

export const getSectionList = async () => {
  const uid = useAuthStore.getState().user?.uid;

  const sectionSnapshot = await sectionCollection
    .where("teachers", "array-contains", uid)
    .get();

  const sections = await Promise.all(
    sectionSnapshot.docs.map(async (sectionDoc) => {
      const sectionData = sectionDoc.data();
      const gradeLevelSnapshot = await gradeLevelCollection
        .doc(sectionData.grade_id)
        .get();

      const gradeLevel = gradeLevelSnapshot.exists()
        ? { id: gradeLevelSnapshot.id, ...(gradeLevelSnapshot.data() as any) }
        : null;

      const section = {
        gradeId: gradeLevel?.id,
        gradeName: gradeLevel?.name,
        sectionId: sectionDoc.id,
        sectionName: sectionData.name,
      };

      return section;
    })
  );

  return sections;
};

export const addStudentToSection = async (
  learnerId: string,
  sectionId: string
) => {
  try {
    await sectionCollection
      .doc(sectionId)
      .update({ students: arrayUnion(learnerId) });

    return { success: true };
  } catch (error) {
    console.log("Error adding student to section: ", error);
    return { success: false };
  }
};
