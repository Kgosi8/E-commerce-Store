import { Order } from "./order";

export interface ListOrdersResponse {
    success: boolean;
    total:   number;
    page:    number;
    pages:   number;
    orders:  Order[];
}
