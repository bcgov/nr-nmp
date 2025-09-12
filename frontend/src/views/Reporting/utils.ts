export function getFertilizerUnitKgPerAcreConversion(unitId: number) {
  switch (unitId) {
    // Pounds per acre
    case 1:
      return 0.4536;
    case 2:
      return 0.4047;
    case 7:
      return 19.759;
    default:
      console.error(`Unrecognized dry fertilizer unit: ${unitId}`);
      return 0;
  }
}

/**
 * @param unit A liquid fertilizer unit id
 * @returns The conversion factor to convert that unit to US gallons per acre
 */
export function getFertilizerUnitUSGallonPerAcreConversion(unitId: number) {
  switch (unitId) {
    // Litres per acre
    case 3:
      return 3.875;
    // Imperial gallons per acre
    case 4:
      return 0.8326;
    case 5:
      return 1;
    // Litres per hectare
    case 6:
      return 0.1069;
    default:
      console.error(`Unrecognized liquid fertilizer unit: ${unitId}`);
      return 0;
  }
}