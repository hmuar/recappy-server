const Label = {
  Note: 'note',
  Subject: 'subject',
  Unit: 'unit',
  Topic: 'topic',
  Concept: 'concept',
};

export default Label;

export function getParentLabelForLevel(level) {
  const parents = [Label.Subject,
                   Label.Unit,
                   Label.Topic,
                   Label.Concept];
  if (level < 0 || level >= parents.length) {
    return null;
  }
  return parents[level];
}
