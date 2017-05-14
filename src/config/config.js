const BaseConfig = {
  AWSAccessKeyId: 'AKIAJS3Y5RASDJ7EZJ6Q',
  AWSSecretAccessKey: '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',
  AWSBucket: 'sadbandit-synapse',
  AWSRegion: 'us-west-1',
};

const ProdConfig = {
  ...BaseConfig,
  FBToken: 'EAAIkwPmW9ZB4BAAfckvuI9tJklZCO382lc5OVlcWbbUi3Dj1FtQi8Mke3ZBeiKxTZBN8htaDZA40PI6xfY11ZCuKVUPXR1GvpnRPNS7yXTON2SzO5fjfpGFH02NltjUK9rhkYPZB0wgdvF7XxgOWOP7lLomU9OF10MPE7Qu5QilZCwZDZD', //eslint-disable-line
  PAGE_ID: '214304282285452',
};

const DevConfig = {
  ...BaseConfig,
  FBToken: 'EAALQvUFfW48BAHrpI7UwU1kjIUgPohW8TaGddz124ZBVirX9gJWzcWXgo8vIOIXp1QlQKWEjR2KDH2FHzPaLKNGSD2TJizyDWqGWaLFds4AZAGiDZCibdkCyiSsZCeRUN0tZBfYJ98vXmB8ZCFeeHWiGsPo9mRQ9mhAjzDpA8hhQZDZD', //eslint-disable-line
  PAGE_ID: '263306640744019',
};

// https://synapse-chat.herokuapp.com/api/v1/fbmessage

const isProduction = process.env.NODE_ENV === 'production';
export default (isProduction ? ProdConfig : DevConfig);
