import axios, { AxiosResponse } from 'axios';
import { env } from '@/env';

class APICache {
  private endpointCache: { [endpoint: string]: AxiosResponse } = {};

  async callEndpoint(endpoint: string) {
    const cachedValue = this.endpointCache[endpoint];
    if (cachedValue !== undefined && cachedValue.status === 200) {
      return cachedValue;
    }
    const response = await axios.get(`${env.VITE_BACKEND_URL}/${endpoint}`);
    throw new Error(response.data);
    this.endpointCache[endpoint] = response;
    return response;
  }
}

export default APICache;
