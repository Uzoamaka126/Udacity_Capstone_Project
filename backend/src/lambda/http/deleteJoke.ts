import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteJoke } from '../../businessLogic/jokesLogic'
import * as middy from 'middy'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete-a-joke')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const jokeId = event.pathParameters.jokeId
    const jwtToken: string = getToken(event.headers.Authorization)

    try {
      await deleteJoke(jokeId, jwtToken);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      }
    } catch (e) {
      logger.error('Error: ' + e.message)

      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)