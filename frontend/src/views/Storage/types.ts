import { ManureInSystem, NMPFileManureStorageSystem } from '@/types';

export type StorageModalMode =
  | { mode: 'create' }
  | { mode: 'system_edit'; systemIndex: number }
  | { mode: 'storage_create'; systemIndex: number }
  | { mode: 'storage_edit'; systemIndex: number; storageIndex: number };

export type StorageModalFormData =
  | NMPFileManureStorageSystem
  | { name: string; manureType: undefined; manuresInSystem: ManureInSystem[] };

export const DEFAULT_FORM_DATA = {
  name: '',
  manureType: undefined,
  manuresInSystem: [],
};
