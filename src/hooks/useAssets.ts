import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AssetsApi } from "../api/assetsApi";
import * as SecureStore from 'expo-secure-store';


export interface Quantity {
  value: number;
  unit: string;
}

export interface AssetsHistoryDetails {
  quantityReceived?: Quantity;
  shipmentID?: string;
}

export interface AssetsHistory {
  type: string;
  actorMSP: string;
  actorID: string;
  timestamp: string;
  txID: string;
  details: AssetsHistoryDetails | string | null;
}

export interface AssetsBatch {
  assetID: string;
  parentAssetIDs: string[];
  productName: string;
  ownerOrg: string;
  originalQuantity: Quantity;
  currentQuantity: Quantity;
  history: AssetsHistory[];
  status: string;
}

export interface UnprocessedAsset extends AssetsBatch {}

export interface ProcessedAsset extends AssetsBatch {}

interface AssetsState {
  unprocessed: UnprocessedAsset[];
  processed: ProcessedAsset[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AssetsState = {
  unprocessed: [],
  processed: [],
  status: "idle",
  error: null,
};

// Async thunk để fetch unprocessed assets
export const fetchUnprocessedAssets = createAsyncThunk<
  UnprocessedAsset[],
  void,
  { rejectValue: string }
>("assets/fetchUnprocessedAssets", async (_, { rejectWithValue }) => {
  try {
    const facilityID = await SecureStore.getItemAsync('facilityID');
    const data = await AssetsApi.getUnprocessed(facilityID as string); // data thẳng từ axios
    console.log("Fetch unprocessed assets response:", data);
    return data as UnprocessedAsset[];
  } catch (err: any) {
    console.error("Error fetching unprocessed assets:", err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk để fetch processed assets
export const fetchProcessedAssets = createAsyncThunk<
  ProcessedAsset[],
  void,
  { rejectValue: string }
>("assets/fetchProcessedAssets", async (_, { rejectWithValue }) => {  
  try {
    const facilityID = await SecureStore.getItemAsync('facilityID');
    const data = await AssetsApi.getProcessed(facilityID as string);
    console.log("Fetch processed assets response:", data);
    return data as ProcessedAsset[];
  } catch (err: any) {
    console.error("Error fetching processed assets:", err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || err.message);
  }

});

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnprocessedAssets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUnprocessedAssets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.unprocessed = action.payload;
      })
      .addCase(fetchUnprocessedAssets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProcessedAssets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProcessedAssets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.processed = action.payload;
      })
      .addCase(fetchProcessedAssets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {  } = assetsSlice.actions;
export default assetsSlice.reducer;

