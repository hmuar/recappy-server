const BaseConfig = {
  AWSAccessKeyId: '',
  AWSSecretAccessKey: '',
  AWSBucket: '',
  AWSRegion: '',
};

const ProdConfig = {
  ...BaseConfig,
  FBToken: '', //eslint-disable-line
  PAGE_ID: '',
};

const DevConfig = {
  ...BaseConfig,
  FBToken: '', //eslint-disable-line
  PAGE_ID: '',
};

const isProduction = process.env.NODE_ENV === 'production';
export default (isProduction ? ProdConfig : DevConfig);
