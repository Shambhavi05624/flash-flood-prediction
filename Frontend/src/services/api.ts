import axios, { AxiosError } from 'axios';
import {
  EnvironmentalFeatures,
  FORBIDDEN_MODEL_INPUTS,
  HealthResponse,
  PredictionResponse,
  AlertItem,
  HistoricalRecord,
  DataSourceInfo,
} from '../types';

export const getApiBaseUrl = (): string => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('custom_api_base_url') : null;
  if (customUrl) {
    return customUrl.replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  // Default to relative root if running in fullstack dev server
  return '';
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    if (!url.trim()) {
      localStorage.removeItem('custom_api_base_url');
    } else {
      localStorage.setItem('custom_api_base_url', url.trim().replace(/\/+$/, ''));
    }
  }
};

const createClient = () => {
  const baseURL = getApiBaseUrl();
  return axios.create({
    baseURL,
    timeout: 12000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
};

export class ApiError extends Error {
  statusCode?: number;
  details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const handleAxiosError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string | Array<{ msg: string; loc?: string[] }>; message?: string }>;
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;
      let detailMsg = fallbackMessage;

      if (data) {
        if (typeof data.detail === 'string') {
          detailMsg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          detailMsg = data.detail.map((d) => d.msg).join('; ');
        } else if (data.message) {
          detailMsg = data.message;
        }
      }

      if (status === 400) {
        throw new ApiError(`Invalid request: ${detailMsg}`, 400, data);
      }
      if (status === 401) {
        throw new ApiError('Authentication required to access prediction services.', 401, data);
      }
      if (status === 403) {
        throw new ApiError('Access forbidden: insufficient credentials for model endpoint.', 403, data);
      }
      if (status === 404) {
        throw new ApiError(`Resource not found (404): ${detailMsg}`, 404, data);
      }
      if (status === 422) {
        throw new ApiError(`Pydantic Validation Error (422): ${detailMsg}`, 422, data);
      }
      if (status >= 500) {
        throw new ApiError(`Backend / Model failure (500): ${detailMsg}`, status, data);
      }

      throw new ApiError(`Request failed with status ${status}: ${detailMsg}`, status, data);
    }

    if (err.code === 'ECONNABORTED' || err.message.toLowerCase().includes('timeout')) {
      throw new ApiError('Request timed out while waiting for model inference. Please try again.', 408);
    }

    const currentUrl = getApiBaseUrl();
    throw new ApiError(
      `Prediction service backend unavailable (${currentUrl || 'Local Endpoint'}). Verify FastAPI is running at ${
        currentUrl || 'http://localhost:8000'
      }.`,
      0
    );
  }

  if (error instanceof Error) {
    throw new ApiError(error.message);
  }

  throw new ApiError(fallbackMessage);
};

export const apiService = {
  /**
   * Check backend health and model status
   * Expected: { status: "ok", model: "loaded" }
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const client = createClient();
      const response = await client.get<HealthResponse>('/health');
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Backend health check failed');
    }
  },

  /**
   * Run prediction risk on exact 33 features
   * Enforces rejection of any forbidden target proxy fields
   */
  async predictRisk(payload: EnvironmentalFeatures): Promise<PredictionResponse> {
    // Client-side strict guard against target leakage
    const payloadKeys = Object.keys(payload);
    const forbiddenFound = payloadKeys.filter((k) =>
      FORBIDDEN_MODEL_INPUTS.includes(k as (typeof FORBIDDEN_MODEL_INPUTS)[number])
    );

    if (forbiddenFound.length > 0) {
      throw new ApiError(
        `Critical Security Violation: Forbidden target proxy fields detected in payload: [${forbiddenFound.join(
          ', '
        )}]. These fields must never be submitted to the model.`,
        422
      );
    }

    // Verify 33 features are present
    const requiredKeys: (keyof EnvironmentalFeatures)[] = [
      'latitude',
      'longitude',
      'elevation_m',
      'slope_deg',
      'aspect_deg',
      'curvature_dem',
      'aspect_northness',
      'aspect_eastness',
      'slope_sin',
      'slope_cos',
      'lulc_class',
      'rain_1d_mm',
      'rain_3d_mm',
      'rain_7d_mm',
      'rain_15d_mm',
      'rain_30d_mm',
      'hist_rain_mean_mm',
      'hist_rain_max_month_mm',
      'hist_rain_std_mm',
      'soil_moisture_gwet_top',
      'hist_soil_mean',
      'hist_soil_max',
      'hist_soil_min',
      'hist_temp_mean',
      'hist_temp_max',
      'hist_temp_min',
      'hist_rh_mean',
      'hist_wind_mean',
      'state',
      'district',
      'lulc_name',
      'srtm_tile',
      'nearest_river_name',
    ];

    const missingKeys = requiredKeys.filter((key) => payload[key] === undefined || payload[key] === null);
    if (missingKeys.length > 0) {
      throw new ApiError(`Validation error: Missing required runtime features: ${missingKeys.join(', ')}`, 422);
    }

    try {
      const client = createClient();
      const response = await client.post<PredictionResponse>('/api/v1/predict', payload);
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Prediction assessment failed');
    }
  },

  /**
   * Fetch environmental features for a specific location / coordinate
   */
  async getLocationFeatures(locationId: string): Promise<EnvironmentalFeatures> {
    try {
      const client = createClient();
      const response = await client.get<EnvironmentalFeatures>(`/api/v1/location/${locationId}`);
      return response.data;
    } catch (error) {
      return handleAxiosError(error, `Failed to fetch features for location ${locationId}`);
    }
  },

  /**
   * Fetch historical flood and rainfall analysis records
   */
  async getHistoricalData(): Promise<HistoricalRecord[]> {
    try {
      const client = createClient();
      const response = await client.get<HistoricalRecord[]>('/api/v1/history');
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Failed to fetch historical flood records');
    }
  },

  /**
   * Fetch prediction history log
   */
  async getPredictionHistory(): Promise<PredictionResponse[]> {
    try {
      const client = createClient();
      const response = await client.get<PredictionResponse[]>('/api/v1/predictions');
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Failed to fetch prediction history');
    }
  },

  /**
   * Fetch active alerts and warnings
   */
  async getAlerts(): Promise<AlertItem[]> {
    try {
      const client = createClient();
      const response = await client.get<AlertItem[]>('/api/v1/alerts');
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Failed to fetch active alerts');
    }
  },

  /**
   * Fetch data source telemetry status
   */
  async getDataSources(): Promise<DataSourceInfo[]> {
    try {
      const client = createClient();
      const response = await client.get<DataSourceInfo[]>('/api/v1/sources');
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Failed to fetch data sources');
    }
  },
};
