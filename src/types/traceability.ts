// src/types/traceability.ts

export interface QuantityValue {
  unit: string;
  value: number;
}

export interface ProcessingStep {
  name: string;
  timestamp: string;
}

export interface EventDetails {
  facilityName?: string;
  farmOrgName?: string;
  harvestDate?: string;
  pesticides?: string[];
  processorOrgName?: string;
  steps?: ProcessingStep[];
  shipmentID?: string;
  description?: string;
  receivedFacility?: string;
  quantityReceived?: QuantityValue;
  ownerOrgName?: string;
  locationInStore?: string;
  temperature?: string;
  retailerOrgName?: string;
  saleTimestamp?: string;
}

export interface TraceabilityEvent {
  type: string;
  actorMSP: string;
  timestamp: string;
  txID: string;
  details: EventDetails;
}

export interface TraceabilityData {
  assetID: string;
  parentAssetIDs: string[];
  productName: string;
  status: string;
  fullHistory: TraceabilityEvent[];
}

export type DetailValue =
  | string
  | number
  | string[]
  | QuantityValue
  | ProcessingStep[]
  | null
  | undefined;
