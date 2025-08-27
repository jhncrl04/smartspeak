import { useAuthStore } from "@/stores/userAuthStore";
import firestore, { arrayUnion } from "@react-native-firebase/firestore";

const userCollection = firestore().collection("users");

export const getChild = async () => {
  try {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid) throw new Error("No authenticated user");

    const snapshot = await userCollection.where("guardianId", "==", uid).get();

    // Map through docs and return array of children
    const children = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return children; // returns array of child objects
  } catch (err) {
    console.error("Error fetching children:", err);
    return [];
  }
};

//get students of the logged in teacher
export const getStudents = async () => {
  try {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid) throw new Error("No authenticated user");

    const userSnapshot = await userCollection.doc(uid).get();
    const studentIds: string[] = userSnapshot.data()?.students || [];

    if (studentIds.length === 0) {
      return [];
    }

    // Firestore `in` queries accept up to 10 values, so batch if necessary
    const batches = [];
    while (studentIds.length) {
      const chunk = studentIds.splice(0, 10); // take up to 10 IDs
      batches.push(
        userCollection
          .where(firestore.FieldPath.documentId(), "in", chunk)
          .get()
      );
    }

    // Run all batches in parallel
    const snapshots = await Promise.all(batches);

    // Merge results
    const students = snapshots.flatMap((snap) =>
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    return students;
  } catch (err) {
    console.error("Error fetching students:", err);
    return [];
  }
};

export const searchAddLearner = async (collection: string, value: string) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) throw new Error("No authenticated user");

  // get current teacher
  const currentUserSnapshot = await userCollection.doc(uid).get();
  const currentStudents: string[] = currentUserSnapshot.data()?.students || [];

  // search for learners by ID prefix
  const snapshot = await firestore()
    .collection(collection)
    .orderBy(firestore.FieldPath.documentId())
    .startAt(value)
    .endAt(value + "\uf8ff")
    .get();

  // filter out existing students
  const results = snapshot.docs
    .filter((doc) => !currentStudents.includes(doc.id))
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  return results;
};

export const addAsStudent = async (studentId: string) => {
  try {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid) throw new Error("No authenticated user");

    console.log(uid);

    userCollection.doc(uid).update({ students: arrayUnion(studentId) });
  } catch (err) {
    console.error("Error adding student:", err);
    return [];
  }
};

export const getStudentInfo = async (studentId: string) => {
  try {
    const snapshot = await userCollection.doc(studentId).get();

    const result = snapshot.data();

    console.log(result);

    return result;
  } catch (err) {
    console.error("Error getting student info:", err);
  }
};
