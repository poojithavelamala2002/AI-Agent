// backend/src/utils/normalize.js
module.exports = function normalize(text = '') {
  // lowercase, remove punctuation, collapse whitespace, trim
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')               // decompose accents (optional)
    .replace(/[^\w\s]/g, '')         // remove punctuation
    .replace(/\s+/g, ' ')            // collapse multiple spaces
    .trim();
};
