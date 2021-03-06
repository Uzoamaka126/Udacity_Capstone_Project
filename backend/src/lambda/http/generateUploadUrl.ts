import 'source-map-support/register'
import { createLogger } from '../../utils/logger';
import * as middy from 'middy';
import { generateUploadUrl } from '../../businessLogic/jokesLogic';

const logger = createLogger('update-a-joke');

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Return a presigned URL to upload a file for a joke item with the provided id
  logger.info('Processing event', event);
  
  try {
    const jokeId = event.pathParameters.jokeId
    const uploadUrl = await generateUploadUrl(jokeId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  } catch (err) {
    logger.error('Error: ' + err.message)

    return {
      statusCode: 500,
      body: err.message
    }
  }
})
