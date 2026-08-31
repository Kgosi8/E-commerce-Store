export interface CheckoutForm {
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  address:    string;
  city:       string;
  province:   string;
  postalCode: string;
  note:       string;
}

export interface CheckoutValidationErrors {
  [field: string]: string;
}