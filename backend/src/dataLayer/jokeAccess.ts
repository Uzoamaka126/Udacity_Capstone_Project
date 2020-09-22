import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { JokeItem } from '../models/JokeItem';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('joke-access');

export class JokeAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly jokesTable = process.env.JOKES_TABLE,
    private readonly bucketName = process.env.JOKES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.JOKES_TABLE_INDEX
  ) {}

  async getAllJokes(userId: string): Promise<JokeItem[]> {
    logger.info('Getting all jokes')

    const result = await this.docClient
      .query({
        TableName: this.jokesTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as JokeItem[]
  }

  async createJoke(joke: JokeItem): Promise<JokeItem> {
    logger.info(`Creating a joke with ID ${joke.jokeId}`);

    const newItem = {
      ...joke,
      attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${joke.jokeId}`
    }

    await this.docClient
      .put({
        TableName: this.jokesTable,
        Item: newItem
      })
      .promise()
    return joke;
  }

  async updateJoke(joke: JokeItem): Promise<JokeItem> {
    logger.info(`Updating a joke with ID ${joke.jokeId}`)
    const updateExpression = 'set #n = :name, description = :description'

    await this.docClient
      .update({
        TableName: this.jokesTable,
        Key: {
          userId: joke.userId,
          jokeId: joke.jokeId
        },
        UpdateExpression: updateExpression,
        ConditionExpression: 'jokeId = :jokeId',
        ExpressionAttributeValues: {
          ':name': joke.name,
          ':description': joke.description,
          ':jokeId': joke.jokeId
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return joke;
  }

  async deleteJoke(jokeId: string, userId: string): Promise<string> {
    logger.info(`Deleting a joke with ID ${jokeId}`)

    await this.docClient
      .delete({
        TableName: this.jokesTable,
        Key: {
          userId,
          jokeId
        },
        ConditionExpression: 'jokeId = :jokeId',
        ExpressionAttributeValues: {
          ':jokeId': jokeId
        }
      })
      .promise()
    return userId;
  }

  async generateUploadUrl(jokeId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: jokeId,
      Expires: this.urlExpiration
    })
  }
}