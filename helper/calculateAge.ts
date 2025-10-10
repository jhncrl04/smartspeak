import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/**
 * Calculate age from a Firestore Timestamp, JS Date, or string (e.g. "2020-01-16")
 */
export const calculateAge = (
  dob: FirebaseFirestoreTypes.Timestamp | Date | string | null
): number | null => {
  try {
    if (!dob) return null;

    let birthDate: Date;

    if (dob instanceof Date) {
      birthDate = dob;
    } else if (typeof dob === "string") {
      birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) {
        console.error("Invalid date string:", dob);
        return null;
      }
    } else if ("toDate" in dob && typeof dob.toDate === "function") {
      birthDate = dob.toDate();
    } else {
      console.error("Unsupported date format:", dob);
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  } catch (err) {
    console.error("Error calculating age:", err);
    return null;
  }
};
