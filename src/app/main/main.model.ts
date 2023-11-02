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

export class Category {
  key?: any;
  name?: string;
  note?: string;
}

export class ProductType {
  key?: any;
  name?: string;
  note?: string;
}

export class Product {
  key?: any;
  name?: string;
  price?: string;
  priceStock?: string;
  qty?: number;
  categoryKey?: string;
  productTypeKey?: string;
  note?: string;
}

