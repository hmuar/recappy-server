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

export default Input;
