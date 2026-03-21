import { CartItem } from "./cart-item";

export interface CartResponse {
    status: string;
    message?: string;
    cart:{
        items: CartItem[];
    }
}
