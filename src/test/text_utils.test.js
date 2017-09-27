import test from 'blue-tape';
import { divideLongText } from '~/core/text_utils';

test('Divide long message', t => {
  const longMsg =
    'Think of a big stadium like a football field or baseball field. Pretend this is our atom. Take two red marbles and two yellow marbles. Stick them together to form a little ball. Put this in the center of the big arena. We call the marbles protons and neutrons. The ball they make at the center of an atom is called the nucleus.';
  const result = divideLongText(longMsg, 150);
  t.equal(result.length, 2);

  const longMsg2 =
    "How do we know to use a C or H or O? Each element like Carbon, Oxygen, Hydrogen, has its own symbol. It's a short version of the name that makes it easier to use. Remember when you first learned that A is for Apple? B is Banana? Well C is for Carbon. O is for Oxygen. H is Hydrogen.";
  const result2 = divideLongText(longMsg2, 150);
  t.equal(result2.length, 2);

  t.end();
});

test('Divide long message with http link', t => {
  const longMsg =
    'Think of a big stadium like a football field or https://www.youtube.com/watch?v=bBC-nXj3Ng4 field. Pretend this is our atom. Take two red marbles. Stick them together to form a little ball. Put this in the center of the big arena. We call the marbles protons and neutrons. The ball they make at the center of an atom is called the nucleus.';
  const result = divideLongText(longMsg, 150);
  t.equal(result.length, 2);

  t.end();
});

test('Divide longer message', t => {
  const longMsg =
    'Many local state, city, and business leaders in the US have pledged to commit to the agreement, even if the US as a country technically withdraws. For example, mayor Bill de Blasio explained how New York City vows to help do its part in reducing greenhouse gas emissions by upgrading old energy inefficient buildings throughout the city.';
  const result = divideLongText(longMsg, 100);
  t.equal(result.length, 2);

  t.end();
});
