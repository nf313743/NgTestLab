import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Future, SubTranche } from './models';

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
        let futureSplits = [];

        selected.forEach((id) => {
          const selectedSubTranche = foo.find((x) => x.id === id)!;
          selectedSubTranche.wap = 900;
          selectedSubTranche.isSelected = true;

          /* What has to happen now is that when selection changes all of the Futures will be applied to the
          // selected sub-tranches FIFO.

          e.g.
          You have 12 lots to apply -> they all go onto 1A.  Lets do this one first.  Then, reduce 1A Unpriced Lots to 3. This will cause a split of the first future.

            */
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
        isAllocated: false,
        allocatedTo: null,
      },
      {
        id: 2,
        lots: 4,
        price: 45.6,
        ccyMultiplier: 1,
        futuresPriceWithOffset: 1,
        isAllocated: false,
        allocatedTo: null,
      },
      {
        id: 3,
        lots: 4,
        price: 45.6,
        ccyMultiplier: 1,
        futuresPriceWithOffset: 1,
        isAllocated: false,
        allocatedTo: null,
      },
    ];

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
        unpricedLots: 45,
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
