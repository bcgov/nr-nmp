export interface CropNutrients {
  N: number; // Nitrogen
  P2O5: number; // Phosphorus pentoxide
  K2O: number; // Potassium oxide
}

// TODO: Maybe choose better name?
export type NutrientColumns = {
  agronomic: CropNutrients; // "This year"
  cropRemoval: CropNutrients; // "Long term"
};

export interface ManureNutrients extends CropNutrients {
  Moisture: string;
  NH4N: number; // Ammonium
}

export type OtherFormData = {
  name: string;
  nutrients: NutrientColumns;
};

export type CropRow = {
  index: number;
  type: 'crop';
  cropIndex: number;
};

export type OtherFormRow = {
  index: number;
  type: 'other';
  data: OtherFormData;
};

// TODO: Add in the other types
export type NMPFileNutrientRow = CropRow | OtherFormRow;
