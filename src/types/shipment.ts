// Định nghĩa kiểu cho số lượng
type Quantity = {
  unit: string; // đơn vị đo (vd: "con", "kg")
  value: number; // giá trị số
};

// Định nghĩa kiểu cho Item trong mỗi stop
type ShipmentItem = {
  assetID: string; // mã tài sản/lô hàng
  quantity: Quantity; // số lượng
  images: string[]; // danh sách URL hình ảnh
};

// Định nghĩa kiểu cho Stop
type ShipmentStop = {
  facilityId: string; // mã cơ sở (nông trại, chợ, kho,...)
  action: 'PICKUP' | 'DELIVERY'; // hành động (nhận hoặc giao)
  items: ShipmentItem[]; // danh sách items
  isVerified: boolean; // đã xác thực hay chưa
};

export enum ShipmentStatus {
  PENDING = 'PENDING',
  DELIVERIED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  DELIVERING = 'DELIVERING',
}

// Định nghĩa kiểu cho toàn bộ Shipment
type ShipmentResponse = {
  id: string; // mã đơn hàng
  shipmentName: string; // tên chuyến hàng
  createdBy: string; // người tạo
  shipmentType: string; // loại hàng (vd: LIVE_ANIMALS)
  driverEnrollmentID?: string; // ID tài xế trong hệ thống
  driverName?: string; // tên tài xế
  vehiclePlate?: string; // biển số xe
  deliveryAddress: string; // địa chỉ giao
  isDelivered: boolean; // trạng thái đã giao chưa
  shipmentStatus: ShipmentStatus; // trạng thái đơn hàng
  stops: ShipmentStop[]; // danh sách điểm dừng
};
export type { Quantity, ShipmentItem, ShipmentResponse, ShipmentStop };
