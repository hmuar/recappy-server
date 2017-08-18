const BaseConfig = {
  AWSAccessKeyId: 'AKIAJS3Y5RASDJ7EZJ6Q',
  AWSSecretAccessKey: '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',
  AWSBucket: 'sadbandit-synapse',
  AWSRegion: 'us-west-1',
};

const ProdConfig = {
  ...BaseConfig,
  FBToken: 'EAAIkwPmW9ZB4BANa7znQfuhmZCGNdlHWsjpGRdcu3rhpuqJlFrj8miw3YAso8E5g45LdsGG4dZBvqQXCYpZCC6qpmkZCXGydyhzYtZAqfLZB3MPxyhREcCi411Ka6pIXQ9xxZAZCrtGa1j9bN2AiZCMazJ4B19qTj2PlI7fHvAN9hR5wZDZD', //eslint-disable-line
  PAGE_ID: '214304282285452',
};

const DevConfig = {
  ...BaseConfig,
  FBToken: 'EAALQvUFfW48BANZCmSoYTB9XytaZC3ZALanY0usM7byZC0iSzfAyCsX7Vcb3BCE2FenQUbb1XoHlYzpscXA885wcUyFOA5pVnETEIGhk3sqm3piDlIZCznAUZCgPxeEeSjvJ4AOmutDv486obaZALtHv3FyRIJ933VQ5M6mhnMtJQZDZD', //eslint-disable-line
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
