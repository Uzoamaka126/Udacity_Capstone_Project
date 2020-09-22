import 'source-map-support/register';
import * as middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createJoke } from '../../businessLogic/jokesLogic'
import { CreateJokeRequest } from '../../requests/CreateJokeRequest'
import { createLogger } from '../../utils/logger'
import { getToken } from '../../auth/utils';

const logger = createLogger('get_jokes');

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('processing request', event);
  
  try {
    const newJoke: CreateJokeRequest = JSON.parse(event.body)
    const jwtToken: string = getToken(event.headers.Authorization)
    const newJokeItem = await createJoke(newJoke, jwtToken)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        newJokeItem
      })
    }
  } catch (err) {
      logger.error('Error: ' + err.message)
      return {
        statusCode: 500,
        body: err.message
      }
  }
});