declare interface iUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

declare interface iFeature{
    key: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    __v: number,
    _id: string
}


declare interface iTierFeature {
    featureId: string,
    availability: 'INCLUDED'| 'ADD_ON'| 'NOT_AVAILABLE',
    pricing?: {
      model: 'FIXED'| 'PER_SEAT'| 'PERCENTAGE',
      value: number
    }
}

declare interface iTier {
  name: string,
  basePricePerSeat: number,
  features?: iTierFeature[],
}

declare interface iProduct{
    name: string,
    description: string,
    tiers: iTier[],
    createdAt: string,
    updatedAt: string,
    __v: number,
    _id: string
}

declare interface QuoteLineItem {
  featureId?: string;
  name: string; // e.g., "Growth Tier Base Seats"
  type: "BASE_PRODUCT" | "ADD_ON";
  pricingModel: "FIXED" | "PER_SEAT" | "PERCENTAGE";
  unitPrice: number;
  quantity?: number; // defaults to 1
  termMonths: number; // 1, 12, or 24
  termDiscountPercent?: number; // defaults to 0
  calculation?: string;
  notes?: string;
  subtotal: number;
}

// QuoteFinancials.ts
declare interface QuoteFinancials {
  grossTotal: number;
  discountAmount: number;
  netTotal: number;
}

declare interface iQuote {
  _id: string; // MongoDB _id
  name: string;
  customerName?: string;
  shareToken: string;
  productId: string; // ObjectId as string
  productName: string;
  tierName: string;
  baseSeats: number;
  termLength: "MONTHLY" | "ANNUAL" | "TWO_YEAR";
  lineItems: QuoteLineItem[];
  customDiscountPercent: number;
  financials: QuoteFinancials;
  status: "DRAFT" | "SENT" | "ACCEPTED";
  expiryDate: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}