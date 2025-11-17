import axios, { AxiosResponse } from 'axios';
import { env } from '@/env';

class APICache {
  private endpointCache: { [endpoint: string]: AxiosResponse } = {};

  async callEndpoint(endpoint: string) {
    const cachedValue = this.endpointCache[endpoint];
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    // Implemented error handling following https://axios-http.com/docs/handling_errors
    try {
      const response = await axios.get(`${env.VITE_BACKEND_URL}/${endpoint}`);
      if (response.status === 200) {
        // Don't cache errored responses
        this.endpointCache[endpoint] = response;
      }
      return response;
    } catch (error: any) {
      console.error(error);
      // If no response was received, return arbitrary error code
      return error.response || { status: 500 };
    }
  }

  async callEndpointNoCatch(endpoint: string) {
    const cachedValue = this.endpointCache[endpoint];
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    const response = await axios.get(`${env.VITE_BACKEND_URL}/${endpoint}`);
    return response;
  }
}

export default APICache;
