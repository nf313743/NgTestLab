import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import futuresJson from '../../assets/futures.json';
import subTranchesJson from '../../assets/subTranches.json';
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
    map(([futures, subTranches, selectedTranches]) => {
      const futuresCopy = futures.map((x) => Object.assign({}, x));

      const subTrancheCopy = subTranches.map((x) => Object.assign({}, x));

      if (!selectedTranches)
        return { futures: futuresCopy, subTranches: subTrancheCopy } as Combo;

      const selectedSubs = selectedTranches!.flatMap(
        (tranche) => subTrancheCopy.filter((x) => x.trancheNum === tranche)!
      );

      selectedSubs.forEach((x) => (x.isSelected = true));

      attribute(futuresCopy, selectedSubs);

      return { futures: futuresCopy, subTranches: subTrancheCopy } as Combo;
    })
  );

  selectionChange(tranche: number[]) {
    this.selectionSubject.next(tranche);
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
    const subTranches: SubTranche[] = subTranchesJson.map<SubTranche>(
      (x: any) => ({
        ...x,
        isSelected: false,
      })
    );

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
