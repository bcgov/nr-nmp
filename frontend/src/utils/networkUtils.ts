import axios, { AxiosRequestConfig } from 'axios';

export default async function axiosGet(
  url: string,
  config?: AxiosRequestConfig<any> | undefined,
  maxTries = 3,
) {
  let err;
  for (let i = 0; i < maxTries; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(url, config);
      return response;
    } catch (e: any) {
      err = e;
    }
  }
  throw new Error(`Failed to fetch ${url}, ${err.message}`);
}
