const STORAGE_KEY = "hfg-madrasa-data";

export async function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const response = await fetch("assets/hfg/data/madrasas.json");
  const data = await response.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function persistData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
