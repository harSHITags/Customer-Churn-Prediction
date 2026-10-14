import { create } from 'zustand';
import type { 
  PredictionResponse, 
  BatchPredictionResponse, 
  ModelInfoResponse,
  AnalyticsSummaryResponse
} from '../types';
import { getModelInfo, getAnalytics } from '../services/api';

interface ChurnStore {
  latestPrediction: PredictionResponse | null;
  batchResults: BatchPredictionResponse | null;
  modelInfo: ModelInfoResponse | null;
  analytics: AnalyticsSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  setPrediction: (p: PredictionResponse | null) => void;
  setBatchResults: (b: BatchPredictionResponse | null) => void;
  setModelInfo: (m: ModelInfoResponse) => void;
  setAnalytics: (a: AnalyticsSummaryResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  clearPrediction: () => void;
  fetchModelInfo: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

export const useChurnStore = create<ChurnStore>((set) => ({
  latestPrediction: null,
  batchResults: null,
  modelInfo: null,
  analytics: null,
  isLoading: false,
  error: null,
  
  setPrediction: (latestPrediction) => set({ latestPrediction }),
  setBatchResults: (batchResults) => set({ batchResults }),
  setModelInfo: (modelInfo) => set({ modelInfo }),
  setAnalytics: (analytics) => set({ analytics }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearPrediction: () => set({ latestPrediction: null }),
  
  fetchModelInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getModelInfo();
      set({ modelInfo: res.data, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to fetch model info';
      set({ error: errMsg, isLoading: false });
    }
  },
  
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getAnalytics();
      set({ analytics: res.data, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to fetch analytics summary';
      set({ error: errMsg, isLoading: false });
    }
  }
}));
