import { calcWap } from './myFuncs';

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

export class SubTranche {
  id!: number;
  trancheNum!: number;
  subTrancheNum!: number;
  subTrancheChar!: string;
  begTime!: string;
  endTime!: string;
  hedgeMonth!: string;
  quantity!: number;
  pricedLots!: number;
  unpricedLots!: number;
  wap!: number;
  futuresPremium!: number;
  clientFuturesExecutionLevel!: number;
  contractualDifference!: number;
  invoicePrice!: number;

  isSelected: boolean = false;

  futures: Future[] = [];

  addFuture(future: Future) {
    future.isAllocated = true;
    future.allocatedTo = (future.allocatedTo ?? '') + this.subTrancheStr;
    this.futures = [...this.futures, future];
    this.unpricedLots = this.unpricedLots - future.lots;
    this.pricedLots = this.pricedLots + future.lots;
    this.calcWapMethod();
  }

  removeFuture(future: Future) {
    if (this.futures.map((x) => x.id).includes(future.id)) {
      this.futures = [...this.futures.filter((x) => x.id !== future.id)];
      this.unpricedLots = this.unpricedLots + future.lots;
      this.pricedLots = this.pricedLots - future.lots;
      this.calcWapMethod();
    }
  }

  get subTrancheStr(): string {
    return this.trancheNum.toString() + this.subTrancheChar;
  }

  private calcWapMethod() {
    this.clientFuturesExecutionLevel = calcWap(
      this.futures,
      (x) => x.futuresPriceWithOffset
    );

    var zFeesAmount = this.contractualDifference; // ?

    this.wap = calcWap(this.futures, (x) => x.price);
    this.invoicePrice = this.clientFuturesExecutionLevel + zFeesAmount;
  }

  setFromPriceAvg(values: PriceAvgValues) {
    this.wap = values.wap;
    this.clientFuturesExecutionLevel = values.clientFuturesExecutionLevel;
    var zFeesAmount = this.contractualDifference; // ?
    this.invoicePrice = this.clientFuturesExecutionLevel + zFeesAmount;
  }

  clone(): SubTranche {
    const st = new SubTranche();

    st.begTime = this.begTime;
    st.clientFuturesExecutionLevel = this.clientFuturesExecutionLevel;
    st.contractualDifference = this.contractualDifference;
    st.endTime = this.endTime;
    st.futuresPremium = this.futuresPremium;
    st.hedgeMonth = this.hedgeMonth;
    st.id = this.id;
    st.invoicePrice = this.invoicePrice;
    st.pricedLots = this.pricedLots;
    st.quantity = this.quantity;
    st.subTrancheChar = this.subTrancheChar;
    st.subTrancheNum = this.subTrancheNum;
    st.trancheNum = this.trancheNum;
    st.unpricedLots = this.unpricedLots;
    st.wap = this.wap;
    st.futures = [...this.futures];
    return st;
  }
}

export interface PriceAvgValues {
  wap: number;
  clientFuturesExecutionLevel: number;
}
