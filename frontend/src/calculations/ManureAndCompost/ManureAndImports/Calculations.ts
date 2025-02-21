// public decimal GetDensityFactoredConversionUsingMoisture(decimal moistureWholePercent, string conversionFactor)
// {
//     var moisterPercentDecimal = Convert.ToDouble(moistureWholePercent / 100);
//     var density = GetDensity(moistureWholePercent);

//     return GetDenisityFactoredConversion(density, conversionFactor);
// }

// public decimal GetDenisityFactoredConversion(decimal density, string conversionFactor)
// {
//     var parsedExpression = conversionFactor.Replace("density", density.ToString(), StringComparison.CurrentCultureIgnoreCase);
//     var conversion = Convert.ToDecimal(new DataTable().Compute(parsedExpression, null));

//     return conversion;
// }

// public decimal GetDensity(decimal moistureWholePercent)
// {
//     var moisturePercentDecimal = Convert.ToDouble(moistureWholePercent / 100);
//     if (moistureWholePercent < 40)
//     {
//         return .27m;
//     }
//     else if (moistureWholePercent >= 40 && moistureWholePercent <= 82)
//     {
//         var result = (7.9386 * Math.Pow(moisturePercentDecimal, 3)) - (16.43 * Math.Pow(moisturePercentDecimal, 2)) +
//                      (11.993 * moisturePercentDecimal) - 2.3975;

//         return Convert.ToDecimal(result);
//     }
//     else
//     {
//         return 0.837m;
//     }
// }
import { evaluate } from 'mathjs';

export function getDensity(moistureWholePercent: number): number {
  const moisturePercentDecimal = moistureWholePercent / 100;
  if (moistureWholePercent < 40) {
    return 0.27;
  }
  if (moistureWholePercent >= 40 && moistureWholePercent <= 82) {
    const result =
      7.9386 * moisturePercentDecimal ** 3 -
      16.43 * moisturePercentDecimal ** 2 +
      11.993 * moisturePercentDecimal -
      2.3975;
    return result;
  }
  return 0.837;
}

export function getDensityFactoredConversion(density: number, conversionFactor: string): number {
  const parsedExpression = conversionFactor.replace(/density/gi, density.toString());
  const conversion = math.evaluate(parsedExpression);
  return conversion;
}

export function getDensityFactoredConversionUsingMoisture(
  moistureWholePercent: number,
  conversionFactor: string,
): number {
  const density = getDensity(moistureWholePercent);
  return getDensityFactoredConversion(density, conversionFactor);
}
