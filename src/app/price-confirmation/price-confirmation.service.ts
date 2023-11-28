import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import futuresJson from "../../assets/futures.json";
import { Future, SubTranche } from './models';
import { attribute } from './myFuncs';

@Injectable({
  providedIn: 'root',
})
export class PriceConfirmationService {
  constructor() {}

  private futureSubject = new BehaviorSubject<Future[]>(this.getFutures());
  futureStream$ = this.futureSubject.asObservable();

  private subTrancheSubject = new BehaviorSubject<SubTranche[]>(
    this.getSubTranches()
  );

  subTrancheStream$ = this.subTrancheSubject.asObservable();

  private selectionSubject = new BehaviorSubject<number[] | null>(null);
  selectionStream$ = this.selectionSubject.asObservable();

  combinedStream$: Observable<Combo> = combineLatest([
    this.futureStream$,
    this.subTrancheStream$,
    this.selectionStream$,
  ]).pipe(
    map(([futures, subTranches, selected]) => {
      const futuresCopy = futures.map((x) => Object.assign({}, x));

      const subTrancheCopy = subTranches.map((x) => Object.assign({}, x));

      if (!selected)
        return { futures: futuresCopy, subTranches: subTrancheCopy } as Combo;

      const selectedSubs = selected!.map(
        (id) => subTrancheCopy.find((x) => x.id === id)!
      );

      selectedSubs.forEach((x) => (x.isSelected = true));

      attribute(futuresCopy, selectedSubs);

      return { futures: futuresCopy, subTranches: subTrancheCopy } as Combo;
    })
  );

  selectionChange(ids: number[]) {
    this.selectionSubject.next(ids);
  }

  reset() {
    this.subTrancheSubject.next(this.getSubTranches());
  }

  getFutures(): Future[] {
    const futures: Future[] = futuresJson.map((x: any) => ({
      ...x,
      isAllocated: false,
      allocatedTo: null,
      splitFrom: null,
    }));
    return futures;
  }

  getSubTranches(): SubTranche[] {
    const subTranches: SubTranche[] = [
      {
        isSelected: false,
        id: 1,
        clientFuturesExLvl: 7,
        contractualDiff: 7,
        fPrem: 4,
        invoicePrice: 4,
        pricedLots: 5,
        quantity: 45,
        subTrancheDisplay: '1A',
        subTrancheNum: 1,
        trancheNum: 1,
        unpricedLots: 9,
        wap: 54353,
      },
      {
        isSelected: false,
        id: 2,
        clientFuturesExLvl: 7,
        contractualDiff: 7,
        fPrem: 4,
        invoicePrice: 4,
        pricedLots: 5,
        quantity: 45,
        subTrancheDisplay: '1B',
        subTrancheNum: 2,
        trancheNum: 1,
        unpricedLots: 45,
        wap: 54353,
      },
      {
        isSelected: false,
        id: 3,
        clientFuturesExLvl: 7,
        contractualDiff: 7,
        fPrem: 4,
        invoicePrice: 4,
        pricedLots: 5,
        quantity: 45,
        subTrancheDisplay: '2A',
        subTrancheNum: 1,
        trancheNum: 2,
        unpricedLots: 45,
        wap: 54353,
      },
    ];

    return subTranches;
  }
}

export interface Combo {
  futures: Future[];
  subTranches: SubTranche[];
}

/*
Calc rules

WAP:
  wap =  Math.Abs(futures.Sum(x => x.Lots * x.FuturePrice * x.CcyMultiplier) / futures.Sum(x => x.Lots));

ClientFuturesExecutionLevel:
 ClientFuturesExecutionLevel = Math.Abs(futures.Sum(x => x.Lots * x.FuturesPriceWithOffset * x.CcyMultiplier) / futures.Sum(x => x.Lots));

contractualDiff:
    var zFeesAmount = Fees.Where(x => x.IsPriceLevelFee).Sum(x => x.Amount);


InvoicePrice:
  var zFeesAmount = Fees.Where(x => x.IsPriceLevelFee).Sum(x => x.Amount);
  InvoicePrice = ClientFuturesExecutionLevel + zFeesAmount;
*/
