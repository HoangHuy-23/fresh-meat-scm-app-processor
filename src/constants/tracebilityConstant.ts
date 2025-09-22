// src/constants/traceabilityConstants.ts

export const EVENT_TITLES: Record<string, string> = {
  FARMING: 'Chăn nuôi',
  PROCESSING: 'Chế biến',
  SHIPPING_STARTED: 'Bắt đầu vận chuyển',
  RECEIVING: 'Tiếp nhận tại cửa hàng',
  STORAGE_UPDATE: 'Bảo quản tại cửa hàng',
  SOLD: 'Đã bán',
  CREATED_FROM_PROCESSING: 'Tạo từ chế biến',
  SPLIT_INTO_UNITS: 'Chia thành đơn vị',
  CREATED_AS_UNIT: 'Tạo đơn vị',
};

export const DETAIL_LABELS: Record<string, string> = {
  facilityName: 'Cơ sở',
  farmOrgName: 'Đơn vị chăn nuôi',
  harvestDate: 'Ngày thu hoạch',
  pesticides: 'Thuốc sử dụng',
  processorOrgName: 'Đơn vị chế biến',
  steps: 'Các bước',
  shipmentID: 'Mã vận chuyển',
  description: 'Mô tả',
  receivedFacility: 'Nơi nhận',
  quantityReceived: 'Số lượng nhận',
  ownerOrgName: 'Đơn vị sở hữu',
  locationInStore: 'Vị trí tại cửa hàng',
  temperature: 'Nhiệt độ bảo quản',
  retailerOrgName: 'Đơn vị bán lẻ',
  saleTimestamp: 'Thời điểm bán',
};
