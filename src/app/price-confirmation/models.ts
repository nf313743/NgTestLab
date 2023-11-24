export interface Future {
  id: number;
  lots: number;
  price: number;
}

export interface SubTranche {
  id: number;
  trancheNum: number;
  subTrancheNum: number;
  subTrancheDisplay: string;
  lots: number;
  price: number;
}
