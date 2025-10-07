import getCurrentUid from "@/helper/getCurrentUid";
import imageToBase64 from "@/helper/imageToBase64";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore, {
  arrayRemove,
  arrayUnion,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

const userCollection = firestore().collection("users");

export const getChild = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    const snapshot = await userCollection.where("guardian_id", "==", uid).get();

    // Map through docs and return array of children
    const children = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, "id">),
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

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  profile_pic?: string;
};

// get students of the logged-in teacher
export const getStudents = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    const userSnapshot = await userCollection.doc(uid).get();
    const studentIds: string[] = userSnapshot.data()?.students || [];

    if (studentIds.length === 0) {
      return [];
    }

    // split IDs into chunks of 10
    const chunks: string[][] = [];
    for (let i = 0; i < studentIds.length; i += 10) {
      chunks.push(studentIds.slice(i, i + 10));
    }

    // query Firestore for each chunk
    const queries = chunks.map((chunk) =>
      userCollection.where(firestore.FieldPath.documentId(), "in", chunk).get()
    );

    const snapshots = await Promise.all(queries);

    // flatten results
    const students = snapshots.flatMap((snap) =>
      snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Student, "id">),
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
    let base64Image = await imageToBase64(imageUri);

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
  phoneNumber: string,
  region: string | null,
  province: string | null,
  municipality: string | null,
  barangay: string | null,
  region_name: string | null,
  province_name: string | null,
  municipality_name: string | null,
  barangay_name: string | null
) => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    await userCollection.doc(uid).update({
      first_name: fname,
      last_name: lname,
      phone_number: phoneNumber,
      region: region,
      province: province,
      municipality: municipality,
      barangay: barangay,
      region_name: region_name,
      province_name: province_name,
      municipality_name: municipality_name,
      barangay_name: barangay_name,
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

import { useAuthStore } from "@/stores/userAuthStore";
import { useUsersStore } from "@/stores/userStore";
import { getUserInfo } from "./userApi/Authentication";

export const setLoginState = (
  firebaseUser:
    | FirebaseFirestoreTypes.DocumentData
    | FirebaseAuthTypes.User
    | undefined,
  userDoc: FirebaseFirestoreTypes.DocumentData
) => {
  const login = useAuthStore.getState().login;

  const children: string[] =
    userDoc.role.toLowerCase() === "teacher"
      ? userDoc.students
      : userDoc.children;

  console.log(children);

  login({
    fname: userDoc.first_name,
    lname: userDoc.last_name,
    email: userDoc.email,
    region: userDoc.region,
    province: userDoc.province,
    municipality: userDoc.municipality,
    barangay: userDoc.barangay,
    region_name: userDoc.region_name,
    province_name: userDoc.province_name,
    municipality_name: userDoc.municipality_name,
    barangay_name: userDoc.baranggay_name,
    phoneNumber: userDoc.phone_number as string,
    profile: userDoc.profile_pic as string,
    role: userDoc.role,
    uid: firebaseUser?.uid,
    handledChildren: children,
  });
};

export const checkVerification = async () => {
  const user = auth().currentUser;

  const userDoc = await getUserInfo(user?.uid as string);

  if (userDoc?.role.toLowerCase() !== "learner") {
    return true;
  }

  if (user) {
    await user.reload();
    if (user.emailVerified) {
      console.log("✅ Email is verified!");
      return true;
    } else {
      return false;
    }
  }
  return false;
};

export const removeAsStudent = async (learnerId: string) => {
  try {
    const uid = getCurrentUid();
    if (!uid) throw new Error("No authenticated user");

    userCollection.doc(uid).update({ students: arrayRemove(learnerId) });

    return { success: true };
  } catch (err) {
    console.error("Error adding student:", err);
    return { success: false };
  }
};

export const updateUserInfo = async (
  user_id: string,
  user: {
    first_name: string;
    last_name: string;
    region: string | null;
    region_name: string | null;
    province: string | null;
    province_name: string | null;
    municipality: string | null;
    municipality_name: string | null;
    barangay: string | null;
    barangay_name: string | null;
  }
) => {
  try {
    await userCollection.doc(user_id).update(user);

    return { success: true };
  } catch (err) {
    console.error("Error updating user info: ", err);

    return { success: false, error: err as string };
  }
};

export const requestGuardianChange = async (
  childId: string,
  newGuardianEmail: string,
  currentGuardianId: string
) => {
  try {
    const currentUser = useAuthStore.getState().user;
    const child = useUsersStore.getState().users.find((u) => u.id === childId);

    // 🔍 Find guardian by email
    const guardianQuery = await userCollection
      .where("email", "==", newGuardianEmail.toLowerCase())
      .limit(1)
      .get();

    if (guardianQuery.empty) {
      return {
        success: false,
        error: "No user found with that email.",
      };
    }

    const newGuardianDoc = guardianQuery.docs[0];
    const newGuardian = newGuardianDoc.data();

    if (!newGuardian || newGuardian.role?.toLowerCase() !== "guardian") {
      return {
        success: false,
        error: "The provided user is not a guardian.",
      };
    }

    // ✅ Build notification object safely
    const notif = {
      action: "Child Guardian Request",
      message: `${currentUser?.fname ?? "Someone"} ${
        currentUser?.lname ?? ""
      } wants to set you as ${child?.first_name ?? "their child"} ${
        child?.last_name ?? ""
      }'s guardian`,
      sender_id: currentUser?.uid ?? null,
      sender_info: {
        first_name: currentUser?.fname ?? "",
        last_name: currentUser?.lname ?? "",
        id: currentUser?.uid ?? "",
      },
      receiver_id: newGuardianDoc.id,
      created_for: newGuardianDoc.id,
      receiver_info: {
        first_name: newGuardian?.first_name ?? "",
        last_name: newGuardian?.last_name ?? "",
        id: newGuardianDoc.id,
      },
      learner_id: childId,
      timestamp: firestore.Timestamp.fromDate(new Date()),
      read: false,
    };

    await firestore().collection("userNotifications").add(notif);

    return { success: true };
  } catch (error) {
    console.error("Guardian change request error:", error);
    return { success: false, error: "Network or server error occurred." };
  }
};

export const respondToGuardianChangeRequest = async (
  response: string,
  notification: any
) => {
  try {
    const child = await getStudentInfo(notification.learnerId);
    const currentUser = useAuthStore.getState().user;

    const senderInfo = {
      first_name: currentUser?.fname,
      last_name: currentUser?.lname,
      id: currentUser?.uid,
    };
    const receiverInfo = {
      first_name: notification.senderInfo?.firstName,
      last_name: notification.senderInfo?.lastName,
      id: notification.senderId,
    };

    if (response === "accept") {
      userCollection
        .doc(notification.learnerId)
        .update({ guardian_id: currentUser?.uid });
      userCollection
        .doc(currentUser?.uid)
        .update({ children: arrayUnion(notification.learnerId) });
      userCollection
        .doc(notification.senderId)
        .update({ children: arrayRemove(notification.learnerId) });

      const notif = {
        action: "Child Guardian Request Accepted",
        message: `${receiverInfo.first_name} ${receiverInfo.last_name} accepted your request to set ${child?.first_name} ${child?.last_name} as his/her child`,
        sender_id: currentUser?.uid,
        sender_info: senderInfo,
        receiver_id: notification.senderId,
        created_for: notification.senderId,
        receiver_info: receiverInfo,
        learner_id: notification.learnerId,
        timestamp: firestore.Timestamp.fromDate(new Date()),
        read: false,
      };

      console.log(notif);

      await firestore().collection("userNotifications").add(notif);

      firestore().collection("userNotifications").doc(notification.id).delete();
    } else if (response === "decline") {
      const notif = {
        action: "Child Guardian Request Declined",
        message: `${receiverInfo.first_name} ${receiverInfo.last_name} declined your request to set ${child?.first_name} ${child?.last_name} as his/her child`,
        sender_id: currentUser?.uid,
        sender_info: senderInfo,
        receiver_id: notification.senderId,
        created_for: notification.senderId,
        receiver_info: receiverInfo,
        learner_id: notification.learnerId,
        timestamp: firestore.Timestamp.fromDate(new Date()),
        read: false,
      };

      console.log(notif);

      await firestore().collection("userNotifications").add(notif);

      firestore().collection("userNotifications").doc(notification.id).delete();
    }
  } catch (error) {
    console.error(error);
  }
};
