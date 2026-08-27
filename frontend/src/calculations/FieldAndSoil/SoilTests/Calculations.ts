import { NMPFileSoilTest, SoilTestMethod, SoilTestNutrientRange } from '@/types';

export function getKelownaRating(
  convertedKelownaNutrient: number,
  nutrientRanges: SoilTestNutrientRange[],
): string {
  return (nutrientRanges.find((r) => convertedKelownaNutrient <= r.upperlimit)
    || nutrientRanges[nutrientRanges.length - 1]).rating;
}

export function soilTestCalculation(
  soilTestMethods: SoilTestMethod[],
  soilTestId: number,
  soilTestData: Pick<NMPFileSoilTest, 'valP' | 'valPH' | 'valK'>,
) {
  const soilTestMethod = soilTestMethods.find((method) => method.id === soilTestId);
  if (!soilTestMethod) {
    throw new Error(`No soil test method with id ${soilTestId}`);
  }
  let convertedKelownaP;
  if (soilTestData.valPH! < 7.2) {
    convertedKelownaP = soilTestData.valP! * soilTestMethod.converttokelownaphlessthan72;
  } else {
    convertedKelownaP = soilTestData.valP! * soilTestMethod.converttokelownaphgreaterthan72;
  }
  const convertedKelownaK = soilTestData.valK! * soilTestMethod.converttokelownak;

  return {
    convertedKelownaP,
    convertedKelownaK,
  };
}
