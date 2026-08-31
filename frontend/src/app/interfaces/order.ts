export type PaymentMethod = 'eft' | 'cod';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'paid'
  | 'failed';

export interface OrderCustomer {
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  address:    string;
  city:       string;
  province:   string;
  postalCode: string;
  note?:      string;
}

export interface OrderItem {
  productId: string;
  name:      string;
  price:     number;
  quantity:  number;
  image?:    string;
}

export interface Order {
  _id:           string;
  orderId:       string;
  eftReference?: string;
  customer:      OrderCustomer;
  items:         OrderItem[];
  paymentMethod: PaymentMethod;
  subtotal:      number;
  deliveryFee:   number;
  total:         number;
  status:        OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt:     string;
}

export interface CreateOrderPayload {
  customer:      OrderCustomer;
  items:         OrderItem[];
  paymentMethod: PaymentMethod;
}

export interface CreateOrderResponse {
  success: boolean;
  order:   Order;
  message?: string;
}

export interface BankDetails {
  bankName:      string;
  accountNumber: string;
  branchCode:    string;
  accountType:   string;
}