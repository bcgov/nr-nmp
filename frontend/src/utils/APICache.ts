import axios, { AxiosResponse } from 'axios';

class APICache {
  private endpointCache: { [endpoint: string]: AxiosResponse } = {};

  async callEndpoint(endpoint: string) {
    const cachedValue = this.endpointCache[endpoint];
    if (cachedValue !== undefined && cachedValue.status === 200) {
      return cachedValue;
    }
    const response = await axios.get(`http://localhost:3000/${endpoint}`);
    this.endpointCache[endpoint] = response;
    return response;
  }
}

export default APICache;
