import axios, { AxiosResponse } from 'axios';
import { env } from '@/env';
import axiosGet from '@/utils/networkUtils';
import { AppStateTables } from '@/types/AppState';

// Type shenanigans from: https://www.reddit.com/r/typescript/comments/nv0icn/is_it_possible_to_create_an_array_union_types_as/
export const InitialEndpoints = [
  'crops',
  'cropsconversionfactors',
  'cropsoiltestphosphorousregions',
  'cropsoilpotassiumregions',
  'croptypes',
  'manures',
  'nmineralizations',
  'previousyearmanureapplications',
  'regions',
  'soiltestmethods',
  'soiltestphosphorouskelonwaranges',
  'soiltestphosphorousranges',
  'soiltestphosphorousrecommendation',
  'soiltestpotassiumkelownaranges',
  'soiltestpotassiumranges',
  'soiltestpotassiumrecommendation',
] as const;

export type InitialEndpoint = (typeof InitialEndpoints)[number];

class APICache {
  private initialized: boolean;

  private endpointCache: { [endpoint: string]: AxiosResponse };

  public promise: Promise<null>;

  private async initialize() {
    await Promise.all(
      InitialEndpoints.map((endpoint) =>
        axiosGet(`${env.VITE_BACKEND_URL}/api/${endpoint}/`).then((res) => {
          if (res.status === 200) {
            this.endpointCache[endpoint] = res;
          }
          // TODO: Handle errors here
        }),
      ),
    ).then(() => {
      this.initialized = true;
    });
    return null;
  }

  constructor() {
    this.initialized = false;
    this.endpointCache = {};
    this.promise = this.initialize();
  }

  async callEndpoint(endpoint: string): Promise<AxiosResponse<any, any, {}>> {
    const cachedValue = this.endpointCache[endpoint];
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    // Implemented error handling following https://axios-http.com/docs/handling_errors
    try {
      const response = await axios.get(`${env.VITE_BACKEND_URL}/${endpoint}`);
      // Don't store errored responses
      if (response.status === 200) {
        this.endpointCache[endpoint] = response;
      }
      return response;
    } catch (error: any) {
      console.error(error);
      // If no response was received, return arbitrary error code
      return error.response || { status: 500 };
    }
  }

  getAppStateTables(): AppStateTables {
    if (!this.initialized) {
      throw new Error('getAppStateTables was called before initialization completed.');
    }
    return {
      crops: this.endpointCache.crops.data,
      cropTypes: this.endpointCache.croptypes.data,
      cropConversionFactors: this.endpointCache.cropsconversionfactors.data[0],
      regions: this.endpointCache.regions.data,
      soilTestPhosphorousKelownaRanges: this.endpointCache.soiltestphosphorouskelonwaranges.data,
      soilTestPotassiumKelownaRanges: this.endpointCache.soiltestpotassiumkelownaranges.data,
      soilTestPhosphorousRecommendations: this.endpointCache.soiltestphosphorousrecommendation.data,
      soilTestPhosphorousRegions: this.endpointCache.cropsoiltestphosphorousregions.data,
      soilTestPotassiumRecommendation: this.endpointCache.soiltestpotassiumrecommendation.data,
      soilTestPotassiumRegions: this.endpointCache.cropsoilpotassiumregions.data,
    };
  }

  getInitializedResponse(endpoint: InitialEndpoint) {
    if (!this.initialized) {
      throw new Error('getInitializedResponse was called before initialization completed.');
    }
    return this.endpointCache[endpoint];
  }
}

export default APICache;
