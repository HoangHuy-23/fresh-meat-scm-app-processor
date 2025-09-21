import axiosClient from "./axiosClient";

export const AssetsApi = {
  getUnprocessed: async (facilityID: string) => {
    try {
      const response = await axiosClient.get(
        `/processors/${facilityID}/assets/unprocessed`
      );
      return response.data;
    } catch (error) {
      console.error("Error while fetching assets:", error);
      throw error;
    }
  },
  getProcessed: async (facilityID: string) => {
    try {
      const response = await axiosClient.get(
        `/processors/${facilityID}/assets/processed`
      );
      return response.data;
    } catch (error) {
      console.error("Error while fetching assets:", error);
      throw error;
    }
  },
  processAsset: async (data: any) => {
    try {
      const response = await axiosClient.post(`/assets/split`, data);
      return response.data;
    } catch (error) {
      console.error("Error while splitting asset:", error);
      throw error;
    }
  },
};
