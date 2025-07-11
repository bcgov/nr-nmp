import axios, { AxiosResponse } from 'axios';
import { env } from '@/env';

class APICache {
  private endpointCache: { [endpoint: string]: AxiosResponse } = {};

  async callEndpoint(endpoint: string) {
    const cachedValue = this.endpointCache[endpoint];
    if (cachedValue !== undefined && cachedValue.status === 200) {
      return cachedValue;
    }
    // Implemented error handling following https://axios-http.com/docs/handling_errors
    try {
      const response = await axios.get(`${env.VITE_BACKEND_URL}/${endpoint}`);
      this.endpointCache[endpoint] = response;
      return response;
    } catch (error: any) {
      console.error(error);
      // If no response was received, return arbitrary error code
      return error.response || { status: 500 };
    }
  }
}

export default APICache;
