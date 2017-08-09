// breaks up text into 2 sentences based on end of sentence punctuation
// if text longer than maxlength
export function divideLongText(text, maxLength) {
  if (text.length > maxLength) {
    const result = text.match(/[^\.!\?]+[\.!\?]+/g).map(t => t.trim());
    if (result.length > 1) {
      const splitIndex = Math.floor(result.length / 2);
      return [
        result.slice(0, splitIndex).join(' '),
        result.slice(splitIndex, result.length).join(' ')
      ];
    }
  }
  return [text];
}
