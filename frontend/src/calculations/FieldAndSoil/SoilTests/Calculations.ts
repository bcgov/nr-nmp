import { NMPFileSoilTest, SoilTestMethods } from '@/types';

export default function soilTestCalculation(
  soilTestMethods: SoilTestMethods[],
  soilTestId: number,
  soilTestData: Pick<NMPFileSoilTest, 'valP' | 'valPH' | 'valK'>,
) {
  // Calculate convertedKelownaP directly
  const lessThan72 = soilTestMethods.find(
    (method) => method.id === soilTestId,
  )!.converttokelownaphlessthan72;
  const greaterThan72 = soilTestMethods.find(
    (method) => method.id === soilTestId,
  )!.converttokelownaphgreaterthan72;

  let convertedKelownaP = soilTestData.valP!;

  if (soilTestData.valPH! < 7.2 && lessThan72 !== undefined) {
    convertedKelownaP = soilTestData.valP! * lessThan72;
  } else if (soilTestData.valPH! >= 7.2 && greaterThan72 !== undefined) {
    convertedKelownaP = soilTestData.valP! * greaterThan72;
  }

  // Calculate converted Kelowna K value (if you need it)
  const convertedKelownaK =
    soilTestMethods.find((method) => method.id === soilTestId)!.converttokelownak !== undefined
      ? soilTestData.valK! *
        soilTestMethods.find((method) => method.id === soilTestId)!.converttokelownak
      : soilTestData.valK!;

  if (!(lessThan72 || greaterThan72)) {
    throw new Error('Unable to calculate convertedKelownaP');
  }
  if (!convertedKelownaK) {
    throw new Error('Unable to calculate convertedKelownaK');
  }
  return {
    convertedKelownaP,
    convertedKelownaK,
  };
}
