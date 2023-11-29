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

  private selectionTrancheSubject = new BehaviorSubject<number[] | null>(null);
  selectionTrancheStream$ = this.selectionTrancheSubject.asObservable();

  private selectionFutureSubject = new BehaviorSubject<number[] | null>(null);
  selectionFutureStream$ = this.selectionFutureSubject.asObservable();

  combinedStream$: Observable<Combo> = combineLatest([
    this.futureStream$,
    this.subTrancheStream$,
    this.selectionTrancheStream$,
    this.selectionFutureStream$,
  ]).pipe(
    map(([futures, subTranches, selectedTranches, selectedFutures]) => {
      const futuresCopy = futures.map((x) => Object.assign({}, x));
      futuresCopy.forEach((x) => {
        if (selectedFutures?.includes(x.id)) x.isSelected = true;
      });

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

  selectionSubTrancheChange(tranches: number[]) {
    this.selectionTrancheSubject.next(tranches);
  }

  selectionFutureChange(futureIds: number[]) {
    this.selectionFutureSubject.next(futureIds);
  }

  getFutures(): Future[] {
    const futures: Future[] = futuresJson.map((x: any) => ({
      ...x,
      isSelected: false,
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
