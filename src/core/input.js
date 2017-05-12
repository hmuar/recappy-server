const InputType = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  INITIALIZE_NEW_USER: 'initialize_new_user',
  CUSTOM: 'custom',
  PATH: 'path',
  CHALLENGE: 'challenge',
  UNKOWN: 'unknown',
};

const Input = {
  Type: InputType,
};

export function getChoiceInput(num) {
  return `choice-${num}`;
}

export function getPathInput(index) {
  return `path-${index}`;
}

export const AffirmitiveInputs = 'yes || ya || yep || yea || ok || yup || uh-huh || affirmative';
export const NegativeInputs = 'no || na || nah || nope || not || negative';

export default Input;
