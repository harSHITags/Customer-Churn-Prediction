import axios from 'axios';
import type { 
  CustomerInput, 
  PredictionResponse, 
  BatchPredictionResponse, 
  ModelInfoResponse, 
  AnalyticsSummaryResponse 
} from '../types';

// Use 127.0.0.1 to avoid potential localhost resolution delays on Windows systems
const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000' 
});

export const predictSingle = (data: CustomerInput) =>
  API.post<PredictionResponse>('/predict', data);

export const predictBatch = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return API.post<BatchPredictionResponse>('/predict/csv', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getModelInfo = () =>
  API.get<ModelInfoResponse>('/model/info');

export const getAnalytics = () =>
  API.get<AnalyticsSummaryResponse>('/analytics/summary');
