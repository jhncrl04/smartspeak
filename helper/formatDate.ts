// helper/formatDate.ts
export const formatDate = (date: Date | string | null): string => {
  if (!date) return "";

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0"); // 01 → 09
  const month = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();

  return `${month} ${day}, ${year}`;
};

export function toDate(obj: any): Date | null {
  if (!obj) return null;

  // If it's already a Firestore Timestamp
  if (obj.toDate) {
    return obj.toDate();
  }

  // If it's the raw { seconds, nanoseconds } object
  if (typeof obj.seconds === "number" && typeof obj.nanoseconds === "number") {
    return new Date(obj.seconds * 1000 + obj.nanoseconds / 1000000);
  }

  // If it's a string
  if (typeof obj === "string") {
    return new Date(obj);
  }

  return null;
}
