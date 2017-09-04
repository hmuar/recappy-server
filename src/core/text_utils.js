// breaks up text into 2 sentences based on end of sentence punctuation
// if text longer than maxlength
export function divideLongText(text, maxLength) {
  if (text.length > maxLength) {
    // const result = text.match(/[.!?]+ /g).map(t => t.trim());

    // find all indexes where sentences end
    const re = /[.!?] /g;
    let match = '';
    const matchIndexes = [];
    while ((match = re.exec(text)) != null) {
      matchIndexes.push(match.index);
    }

    if (matchIndexes.length > 1) {
      const splitIndex = matchIndexes[Math.floor(matchIndexes.length / 2)];
      return [text.slice(0, splitIndex + 1).trim(), text.slice(splitIndex + 2).trim()];
    }
  }
  return [text];
}
