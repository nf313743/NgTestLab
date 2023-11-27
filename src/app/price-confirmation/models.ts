export interface Future {
  id: number;
  lots: number;
  price: number;
  ccyMultiplier: number;
  futuresPriceWithOffset: number;
}

export interface SubTranche {
  isSelected: boolean;
  id: number;
  trancheNum: number;
  subTrancheNum: number;
  subTrancheDisplay: string;
  quantity: number;
  pricedLots: number;
  unpricedLots: number;
  wap: number;
  fPrem: number;
  clientFuturesExLvl: number;
  contractualDiff: number;
  invoicePrice: number;
}
