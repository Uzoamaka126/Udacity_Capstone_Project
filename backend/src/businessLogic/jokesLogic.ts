import * as uuid from 'uuid'
import { JokeItem } from '../models/JokeItem'
import { JokeAccess } from '../dataLayer/jokeAccess';
import { CreateJokeRequest } from '../requests/CreateJokeRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'
import { UpdateJokeRequest } from '../requests/UpdateJokeRequest';

const logger = createLogger('jokes');
const jokeAccess = new JokeAccess();

export async function getAllUserJokes (jwtToken: string): Promise<JokeItem[]> {
  const userId = parseUserId(jwtToken);

  return await jokeAccess.getAllJokes(userId);
}

export async function createJoke (createJokeRequest: CreateJokeRequest, jwtToken: string): Promise<JokeItem> {
  logger.info('In createJoke() function')

  const itemId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await jokeAccess.createJoke({
    jokeId: itemId,
    userId,
    name: createJokeRequest.name,
    description: createJokeRequest.description,
    createdAt: new Date().toISOString()
  })
}

export const updateJoke = async (
  jokeId: string,
  updateJokeRequest: UpdateJokeRequest,
  jwtToken: string
): Promise<JokeItem> => {
  logger.info('Processing request...')

  const userId = parseUserId(jwtToken)
  logger.info('User Id is: ' + userId)

  return await jokeAccess.updateJoke({
    jokeId,
    userId,
    name: updateJokeRequest.name,
    description: updateJokeRequest.description,
    createdAt: new Date().toISOString()
  })
}

export const deleteJoke = async (
  jokeId: string,
  jwtToken: string
): Promise<string> => {
  logger.info('In deleteJoke() function')

  const userId = parseUserId(jwtToken);
  logger.info('User Id: ' + userId);

  return await jokeAccess.deleteJoke(jokeId, userId)
}

export const generateUploadUrl = async (jokeId: string): Promise<string> => {
  logger.info('In generateUploadUrl() function')

  return await jokeAccess.generateUploadUrl(jokeId)
}