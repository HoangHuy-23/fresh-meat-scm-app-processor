import axiosClient from './axiosClient';

export const TraceabilityApi = {
  getTraceabilityData: async (unitId: string) => {
    try {
      const response = await axiosClient.get(`assets/${unitId}/trace`);
      return response.data;
    } catch (error) {
      console.error('Error fetching traceability data:', error);
      throw error;
    }
  },
};
