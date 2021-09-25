import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '2',
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      S3_BUCKET_NAME: '${env:S3_BUCKET_NAME}'
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: '${env:S3_BUCKET_ARN}',
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: '${env:S3_BUCKET_ARN_ALL}',
      },      
    ],
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { importProductsFile },
};

module.exports = serverlessConfiguration;
