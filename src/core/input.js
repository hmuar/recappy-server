const InputType = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  CUSTOM: 'custom',
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

export default Input;
