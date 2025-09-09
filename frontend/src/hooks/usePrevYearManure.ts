import { useState, useEffect, useCallback } from 'react';
import { NMPFileFieldData } from '@/types';
import {
  previousYearManureService,
  PreviousYearManureData,
} from '@/services/previousYearManureService';

/**
 * Custom hook for managing previous year manure calculations
 * @param field - Field data object
 * @returns Hook state and methods
 */
const usePrevYearManure = (field: NMPFileFieldData | null) => {
  const [data, setData] = useState<PreviousYearManureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePrevYearManure = useCallback(async (fieldData: NMPFileFieldData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await previousYearManureService.calculatePrevYearManure(fieldData);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error calculating previous year manure:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (field) {
      calculatePrevYearManure(field);
    } else {
      setData(null);
    }
  }, [field, calculatePrevYearManure]);

  const refetch = useCallback(() => {
    if (field) {
      calculatePrevYearManure(field);
    }
  }, [field, calculatePrevYearManure]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default usePrevYearManure;
