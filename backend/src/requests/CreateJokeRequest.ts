// import { StringMap } from "aws-sdk/clients/ecs";

/**
 * Fields in a request to create a single joke item.
 */
export interface CreateJokeRequest {
  name: string
  description: string,
  createdAt: string
}
