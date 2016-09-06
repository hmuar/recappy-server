function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function generateQuestion(note) {
  if (note.phrase && note.phrase.pre && note.phrase.pre.length > 0) {
    const phrase = note.phrase.pre[Math.floor(Math.random() * note.phrase.pre.length)];
    return capitalizeFirstLetter(`${phrase} ${note.displayRaw}`);
  }
  return capitalizeFirstLetter(note.displayRaw);
}
