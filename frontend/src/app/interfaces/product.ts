export interface Product {
  _id:         string;
  name:        string;
  description: string;
  price:       number;
  category:    string;
  stock:       number;
  images:      string[];
  tags:        string[];
  createdAt:   string;
}

export interface ProductListResponse {
  success:  boolean;
  total:    number;
  page:     number;
  pages:    number;
  products: Product[];
  tag?:     string;
  category?: string;
}
