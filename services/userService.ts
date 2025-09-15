import getCurrentUid from "@/helper/getCurrentUid";
import auth from "@react-native-firebase/auth";
import firestore, { arrayUnion } from "@react-native-firebase/firestore";
import * as FileSystem from "expo-file-system";

const userCollection = firestore().collection("users");

export const getChild = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    const snapshot = await userCollection.where("guardian_id", "==", uid).get();

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

export const listenToChildren = (callback: (children: any[]) => void) => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    const unsubscribe = userCollection
      .where("guardian_id", "==", uid)
      .onSnapshot(
        (snapshot) => {
          const children = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(children); // push updated children to caller
        },
        (err) => {
          console.error("Error listening to children:", err);
          callback([]); // fallback to empty list on error
        }
      );

    return unsubscribe; // caller should clean this up in useEffect
  } catch (err) {
    console.error("Error setting up children listener:", err);
    return () => {}; // return dummy unsubscribe if error
  }
};

//get students of the logged in teacher
export const getStudents = async () => {
  try {
    const uid = getCurrentUid();
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

export const listenToStudents = (
  onUpdate: (students: any[]) => void,
  onError?: (err: any) => void
) => {
  const uid = getCurrentUid();
  if (!uid) {
    onError?.(new Error("No authenticated user"));
    return () => {}; // dummy unsubscribe
  }

  // Main unsubscribe holder
  let studentUnsubs: (() => void)[] = [];

  // Listen to teacher doc for studentIds
  const unsubscribeTeacher = userCollection.doc(uid).onSnapshot(
    (userSnapshot) => {
      const studentIds: string[] = userSnapshot.data()?.students || [];

      // Clear old listeners whenever the student list changes
      studentUnsubs.forEach((u) => u());
      studentUnsubs = [];

      if (studentIds.length === 0) {
        onUpdate([]);
        return;
      }

      const idsCopy = [...studentIds];
      const allStudents: Record<string, any> = {};

      while (idsCopy.length) {
        const chunk = idsCopy.splice(0, 10);

        const unsub = userCollection
          .where(firestore.FieldPath.documentId(), "in", chunk)
          .onSnapshot(
            (snap) => {
              snap.docs.forEach((doc) => {
                allStudents[doc.id] = { id: doc.id, ...doc.data() };
              });

              // Convert object → array
              onUpdate(Object.values(allStudents));
            },
            (err) => onError?.(err)
          );

        studentUnsubs.push(unsub);
      }
    },
    (err) => onError?.(err)
  );

  // Return cleanup function
  return () => {
    unsubscribeTeacher();
    studentUnsubs.forEach((u) => u());
  };
};

export const searchAddLearner = async (collection: string, value: string) => {
  const uid = getCurrentUid();
  if (!uid) throw new Error("No authenticated user");

  // get current teacher
  const currentUserSnapshot = await userCollection.doc(uid).get();
  const currentStudents: string[] = currentUserSnapshot.data()?.students || [];

  const firestoreRef = firestore().collection(collection);

  const results: any[] = [];

  // --- Search by exact ID ---
  const idDoc = await firestoreRef.doc(value).get();
  if (idDoc.exists() && !currentStudents.includes(idDoc.id)) {
    results.push({ id: idDoc.id, ...idDoc.data() });
  }

  // --- Search by exact email ---
  const emailSnapshot = await firestoreRef
    .where("email", "==", value.toLowerCase())
    .get();
  emailSnapshot.docs.forEach((doc) => {
    if (!currentStudents.includes(doc.id)) {
      results.push({ id: doc.id, ...doc.data() });
    }
  });

  return results;
};

export const addAsStudent = async (studentId: string) => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    userCollection.doc(uid).update({ students: arrayUnion(studentId) });

    return { success: true };
  } catch (err) {
    console.error("Error adding student:", err);
    return { success: false };
  }
};

export const getStudentInfo = async (studentId: string) => {
  try {
    const snapshot = await userCollection.doc(studentId).get();

    const result = snapshot.data();

    return result;
  } catch (err) {
    console.error("Error getting student info:", err);
  }
};

export const uploadProfilePic = async (imageUri: string) => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    // Convert to base64
    let base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    base64Image = `data:image/jpeg;base64,${base64Image}`;

    // Save to Firestore
    await userCollection.doc(uid).update({
      profile_pic: base64Image,
    });

    return base64Image; // ✅ return for UI update
  } catch (err) {
    console.error("Error uploading profile: ", err);
    return null;
  }
};

export const updateCurrentUserInfo = async (
  fname: string,
  lname: string,
  phoneNumber: string
) => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    await userCollection.doc(uid).update({
      first_name: fname,
      last_name: lname,
      phone_number: phoneNumber,
    });
  } catch (err) {
    console.error("Error updating user info: ", err);
  }
};

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const user = auth().currentUser;

  if (!user || !user.email) {
    console.error("No user signed in");
  }

  try {
    const credential = auth.EmailAuthProvider.credential(
      user?.email as string,
      currentPassword
    );

    await user?.reauthenticateWithCredential(credential);

    await user?.updatePassword(newPassword);

    return { success: true, message: "Password updated successfully" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
