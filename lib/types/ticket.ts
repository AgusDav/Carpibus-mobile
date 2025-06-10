export interface Ticket {
  id: string;
  trip: Trip;
  passenger: {
    firstName: string;
    lastName: string;
    documentNumber: string;
    email?: string;
    phone?: string;
  };
  seatNumber: number;
  originalPrice: number;
  discountApplied?: Discount;
  finalPrice: number;
  purchaseDate: string;
  status: 'ACTIVE' | 'CANCELLED' | 'USED';
  qrCode?: string;
  pdfUrl?: string;
}

export interface PurchaseRequest {
  tripId: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    documentNumber: string;
    email?: string;
    phone?: string;
    discountId?: string;
  }>;
  returnTripId?: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentMethod {
  type: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  details: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    paypalEmail?: string;
    bankAccount?: string;
  };
}

export interface PurchaseResponse {
  tickets: Ticket[];
  totalAmount: number;
  paymentId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message: string;
}

export interface TicketFilter {
  status?: 'ACTIVE' | 'CANCELLED' | 'USED';
  dateFrom?: string;
  dateTo?: string;
  origin?: string;
  destination?: string;
}

export interface TicketSort {
  field: 'purchaseDate' | 'departureDate' | 'finalPrice' | 'status';
  order: 'asc' | 'desc';
}