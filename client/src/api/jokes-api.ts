import { apiEndpoint } from '../config'
import { Joke } from '../types/Joke';
import { CreateJokeRequest } from '../types/CreateJokeRequest';
import Axios from 'axios'
import { UpdateJokeRequest } from '../types/UpdateJokeRequest';

export async function getJokes(idToken: string): Promise<Joke[]> {
  console.log('Fetching jokes');

  const response = await Axios.get(`${apiEndpoint}/jokes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Jokes:', response.data)
  return response.data.items;
}

export async function createJoke(
  idToken: string,
  newJoke: CreateJokeRequest
): Promise<Joke> {
  const response = await Axios.post(`${apiEndpoint}/jokes`,  JSON.stringify(newJoke), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item;
}

export async function patchJoke(
  idToken: string,
  jokeId: string,
  updatedJoke: UpdateJokeRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/jokes/${jokeId}`, JSON.stringify(updatedJoke), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteJoke(
  idToken: string,
  jokeId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/jokes/${jokeId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  });
}

export async function getUploadUrl(
  idToken: string,
  jokeId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/jokes/${jokeId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
