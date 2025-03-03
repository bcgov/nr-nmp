import axios from 'axios';
import { env } from '@/env';

export async function getRegion(regionId: number) {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/regions/${regionId}/`);
  return response.data;
}

export default async function getCropRequirementP205(regionId: number): Promise<number> {
  const response = await axios.get(`${env.VITE_BACKEND_URL}/api/cropsconversionfactors/`);
  const conversionFactors = response.data[0];

  const region = await getRegion(regionId);

  console.log(conversionFactors);
  console.log(region);
  return 0;
}
