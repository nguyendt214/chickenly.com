export class Customer {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
}

export class School {
  key?: any;
  name?: string;
  address?: string;
  phone?: string;
  note?: string;
  customerKey?: number | null;
}

export class Product {
  key?: any;
  name?: string;
  price?: string;
  priceStock?: string;
  qty?: number;
  note?: string;
}

