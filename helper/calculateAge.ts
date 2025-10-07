import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/**
 * Calculate age from a Firestore Timestamp or JS Date
 */
export const calculateAge = (
  dob: FirebaseFirestoreTypes.Timestamp | Date | null | undefined
): number | null => {
  try {
    if (!dob) return null;

    // Convert Firestore Timestamp to JS Date if needed
    const birthDate = dob instanceof Date ? dob : dob.toDate();
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
    console.error("Error calculating age: ", err);
    return null;
  }
};
