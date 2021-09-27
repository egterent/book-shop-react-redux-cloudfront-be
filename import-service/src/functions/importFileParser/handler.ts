import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { S3, SQS } from 'aws-sdk';
import csvParser from 'csv-parser';
import { logRequest, logError, logInfo } from '../../../../shared/logger/logger';
import { formatErrorResponse } from '../../libs/apiGateway';

const importFileParser = async event => {
    logRequest(event);

    try {
        const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
        const s3 = new S3({ region: 'eu-west-1' });

        const sqs = new SQS();

        for (const record of event.Records) {
            const { key } = record.s3.object;
            console.log(key);

            await new Promise<void>((resolve, reject) => {
                s3.getObject({
                    Bucket: S3_BUCKET_NAME,
                    Key: key,
                })
                    .createReadStream()
                    .on('error', error => {
                        reject(error);
                        logError(error);
                    })
                    .pipe(csvParser())
                    .on('data', async data => {
                        logInfo('Parsed data: ${JSON.stringify(data)}');
                        await sqs.sendMessage(
                            {
                                QueueUrl: process.env.SQS_URL,
                                MessageBody: JSON.stringify(data),
                            }
                        );
                    })
                    .on('error', error => {
                        reject(error);
                        logError(error);
                    })
                    .on('end', async () => {
                        console.log('Finish callback');
                        resolve();
                    });
            });

            logInfo(`Moving from ${S3_BUCKET_NAME}/${key}`);
            const newKey = key.replace('uploaded', 'parsed');

            await s3.copyObject({
                Bucket: S3_BUCKET_NAME,
                CopySource: `${S3_BUCKET_NAME}/${key}`,
                Key: newKey,
            }).promise();

            await s3.deleteObject({
                Bucket: S3_BUCKET_NAME,
                Key: key,
            }).promise();

            logInfo(`Moved to ${S3_BUCKET_NAME}/${newKey}`);
        }

        return {
            statusCode: 200,
            body: '',
        };
    } catch (error) {
        logError(error);

        return formatErrorResponse(500, 'AWS Lambda Error');
    }
};

export const main = middyfy(importFileParser);