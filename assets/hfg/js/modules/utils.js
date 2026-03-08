export const gradeFromAverage = (avg) => {
  if (avg >= 90) return "A+";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B";
  if (avg >= 60) return "C";
  return "D";
};

export const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric"
});

export const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
