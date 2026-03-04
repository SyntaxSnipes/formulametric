//utility function to normalize driver names by removing accents, converting to lowercase, and removing spaces and hyphens
export default function normalizeName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "");
}
