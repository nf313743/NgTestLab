export interface Future {
  id: number;
  lots: number;
  price: number;
  ccyMultiplier: number;
  futuresPriceWithOffset: number;
  productType: string;
  prompt: string;
  tradeDate: string;

  isSelected: boolean;
  isAllocated: boolean;
  allocatedTo: string | null;
  splitFrom: number | null;
}

export interface SubTranche {
  id: number;
  trancheNum: number;
  subTrancheNum: number;
  subTrancheChar: string;
  begTime: string;
  endTime: string;
  hedgeMonth: string;
  quantity: number;
  pricedLots: number;
  unpricedLots: number;
  wap: number;
  futuresPremium: number;
  clientFuturesExecutionLevel: number;
  contractualDifference: number;
  invoicePrice: number;

  isSelected: boolean;
}
