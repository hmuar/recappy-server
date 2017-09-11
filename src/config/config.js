const BaseConfig = {
  AWSAccessKeyId: 'AKIAJS3Y5RASDJ7EZJ6Q',
  AWSSecretAccessKey: '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',
  AWSBucket: 'sadbandit-synapse',
  AWSRegion: 'us-west-1',
};

const ProdConfig = {
  ...BaseConfig,
  FBToken: 'EAAIkwPmW9ZB4BAOLfY8Wv6n2POpYZBcZBfuAWnnyJPOqV2GTLzpSHqHcntml9HZBvug3z9FinIXbYjlRAKhJmsy037zxd1P4T4NTkP7GRHRnCEuXymqDRONazPaxEbSJlb7tnMbBIm3YkdOZCifZBHnQxOVH2siELPEaa6llwaHQZDZD', //eslint-disable-line
  PAGE_ID: '214304282285452',
};

const DevConfig = {
  ...BaseConfig,
  FBToken: 'EAALQvUFfW48BAMJtc0J3vnvkZANt4ZAhUpB79UCOUMcogitMzezN9D99HWSOjZCsPolRiqQiZAeRTLnOok129ShOQ3vaOYtsJBbOuIaoChvv3JnXc2XTj5J73iZC1ZA3q8B85lCmdDMfNZAKp8iRv5dppVQ37KPj20If2vbOjFgQQZDZD', //eslint-disable-line
  PAGE_ID: '263306640744019',
};

// const NotifyConfig = {
//   ...BaseConfig,
//   FBToken: 'EAAIkwPmW9ZB4BANa7znQfuhmZCGNdlHWsjpGRdcu3rhpuqJlFrj8miw3YAso8E5g45LdsGG4dZBvqQXCYpZCC6qpmkZCXGydyhzYtZAqfLZB3MPxyhREcCi411Ka6pIXQ9xxZAZCrtGa1j9bN2AiZCMazJ4B19qTj2PlI7fHvAN9hR5wZDZD', //eslint-disable-line
//   PAGE_ID: '214304282285452',
// };

// https://synapse-chat.herokuapp.com/api/v1/fbmessage

const isProduction = process.env.NODE_ENV === 'production';
export default (isProduction ? ProdConfig : DevConfig);
