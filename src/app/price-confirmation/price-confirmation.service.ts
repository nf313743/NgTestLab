import { Injectable } from '@angular/core';
import { Future, SubTranche } from './models';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PriceConfirmationService {
  constructor() {}

  private backupSubTrancheSubject = new BehaviorSubject<SubTranche[]>(
    this.getSubTranches()
  ); // bad

  backupData$ = this.backupSubTrancheSubject.asObservable();

  private selectionSubject = new BehaviorSubject<number[] | null>(null);
  selectionStream$ = this.selectionSubject.asObservable();

  combinedStream$: Observable<SubTranche[]> = combineLatest([
    this.backupData$,
    this.selectionStream$,
  ]).pipe(
    map(([subTranches, selected]) => {
      const foo = subTranches.map((x) => Object.assign({}, x));

      if (selected) {
        selected.forEach((id) => {
          const selectedSubTranche = foo.find((x) => x.id === id)!;
          selectedSubTranche.wap = 9000;
        });
      }

      return foo;
    })
  );

  selectionChange(ids: number[]) {
    this.selectionSubject.next(ids);
  }

  reset() {
    this.backupSubTrancheSubject.next(this.getSubTranches());
  }

  getFutures(): Future[] {
    const futures: Future[] = [
      {
        id: 1,
        lots: 4,
        price: 45.6,
        ccyMultiplier: 1,
        futuresPriceWithOffset: 1,
      },
      {
        id: 2,
        lots: 4,
        price: 45.6,
        ccyMultiplier: 1,
        futuresPriceWithOffset: 1,
      },
      {
        id: 3,
        lots: 4,
        price: 45.6,
        ccyMultiplier: 1,
        futuresPriceWithOffset: 1,
      },
    ];

    return futures;
  }

  getSubTranches(): SubTranche[] {
    const subTranches: SubTranche[] = [
      {
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
        unpricedLots: 45,
        wap: 54353,
      },
      {
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
