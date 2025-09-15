// helper/formatDate.ts
export const formatDate = (date: Date | string | null): string => {
  if (!date) return "";

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0"); // 01 → 09
  const month = d.toLocaleString("default", { month: "short" });
  const year = d.getFullYear();

  return `${month} ${day}, ${year}`;
};
