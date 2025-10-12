import axiosClient from "./axiosClient";

export const shipmentApi = {
  confirmDeliveryShipment: async (shipmentID: string, data: any) => {
    try {
      const response = await axiosClient.post(
        `/shipments/${shipmentID}/delivery`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error while confirming shipment:", error);
      throw error;
    }
  },

  confirmPickupShipment: async (shipmentID: string, data: any) => {
    try {
      const response = await axiosClient.post(
        `/shipments/${shipmentID}/pickup`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error while confirming shipment:", error);
      throw error;
    }
  },
  createDispatchRequest: async (data: any) => {
    try {
      const response = await axiosClient.post("/dispatch-requests", data);
      return response.data;
    } catch (error) {
      console.error("Error while creating dispatch request:", error);
      throw error;
    }
  },
  getMyDispatchRequests: async () => {
    try {
      const response = await axiosClient.get("/dispatch-requests/my");
      return response.data;
    } catch (error) {
      console.error("Error while fetching dispatch requests:", error);
      throw error;
    }
  },
  getDispatchRequestById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/dispatch-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching dispatch request by ID:", error);
      throw error;
    }
  },
  getMyPickupShipments: async (id: string) => {
    try {
      const response = await axiosClient.get(`facilities/${id}/shipments`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching my pickup shipments:", error);
      throw error;
    }
  },
  getShipmentById: async (id: string) => {
    try {
      const response = await axiosClient.get(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error while fetching shipment by ID:", error);
      throw error;
    }
  },
};
