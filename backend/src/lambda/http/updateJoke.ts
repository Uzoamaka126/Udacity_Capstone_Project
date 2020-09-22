import 'source-map-support/register';
import * as middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getToken } from '../../auth/utils';
import { UpdateJokeRequest } from '../../requests/UpdateJokeRequest';
import { updateJoke } from '../../businessLogic/jokesLogic';
import { createLogger } from '../../utils/logger';

const logger = createLogger('update-joke');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const jokeId: string = event.pathParameters.jokeId;
      const updatedJoke: UpdateJokeRequest = JSON.parse(event.body);
      const jwtToken: string = getToken(event.headers.Authorization);
      await updateJoke(jokeId, updatedJoke, jwtToken);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        // return an empty body
        body: ''
      }
    } catch (err) {
      logger.error('Error', { error: err.message })

      return {
        statusCode: 500,
        body: err.message
      }
    }
  }
)