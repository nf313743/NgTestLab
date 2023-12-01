import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import futuresJson from '../../assets/futures.json';
import subTranchesJson from '../../assets/subTranches.json';
import { Future, SubTranche } from './models';
import { attribute, unAttribute } from './myFuncs';

@Injectable({
  providedIn: 'root',
})
export class PriceConfirmationService {
  constructor() {}

  preSelectedFutureIds = [
    525748, 525749, 525750, 565072, 565073, 565074, 565075, 565076, 581339,
  ];

  preSelectedSubTranches = ['1A', '2A', '3A'];

  private futureSubject = new BehaviorSubject<Future[]>(
    this.getAllData().futures
  );
  futureStream$ = this.futureSubject.asObservable();

  private subTrancheSubject = new BehaviorSubject<SubTranche[]>(
    this.getAllData().subTranches
  );

  subTrancheStream$ = this.subTrancheSubject.asObservable();

  private selectionTrancheSubject = new BehaviorSubject<number[]>([]);
  selectionTrancheStream$ = this.selectionTrancheSubject.asObservable();

  private selectionFutureSubject = new BehaviorSubject<number[]>([]);
  selectionFutureStream$ = this.selectionFutureSubject.asObservable();

  private priceAvgSubject = new BehaviorSubject<boolean>(false);
  priceAvgStream$ = this.priceAvgSubject.asObservable();

  combinedStream$: Observable<Combo> = combineLatest([
    this.futureStream$,
    this.subTrancheStream$,
    this.selectionTrancheStream$,
    this.selectionFutureStream$,
    this.priceAvgStream$,
  ]).pipe(
    map(
      ([futures, subTranches, selectedTranches, selectedFutures, priceAvg]) => {
        const priceAvgMode = priceAvg ? 'Selected' : 'FIFO';

        const futuresCopy = futures.map((x) => Object.assign({}, x));
        futuresCopy.forEach((x) => {
          if (selectedFutures?.includes(x.id)) x.isSelected = true;
        });

        const subTrancheCopy = subTranches.map((x) => x.clone());

        const selectedSubs = selectedTranches!.flatMap((id) => {
          const foo = subTrancheCopy.filter((x) => x.id === id)!;
          foo.forEach((x) => (x.isSelected = true));
          return foo;
        });

        if (selectedTranches.length === 0 || selectedFutures.length === 0)
          return {
            futures: futuresCopy,
            subTranches: subTrancheCopy,
            priceAvgMode: priceAvgMode,
          } as Combo;

        const selectedFuturesCopy = futuresCopy.filter((x) => x.isSelected)!;

        unAttribute(selectedFuturesCopy, subTrancheCopy);

        attribute(selectedFuturesCopy, selectedSubs, priceAvg);

        return {
          futures: futuresCopy,
          subTranches: subTrancheCopy,
          priceAvgMode: priceAvgMode,
        } as Combo;
      }
    )
  );

  selectionSubTrancheChange(subTrancheIds: number[]) {
    this.selectionTrancheSubject.next(subTrancheIds);
  }

  selectionTrancheChange(tranches: number[]) {
    const subTrancheIds = tranches.flatMap((trancheNum) =>
      this.subTrancheSubject.value
        .filter((x) => x.trancheNum === trancheNum)
        .map((x) => x.id)
    );

    this.selectionSubTrancheChange(subTrancheIds);
  }

  selectionFutureChange(futureIds: number[]) {
    this.selectionFutureSubject.next(futureIds);
  }

  emitPriceAvg(value: boolean) {
    this.priceAvgSubject.next(value);
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
      (x: any) => {
        const st = new SubTranche();
        st.begTime = x.begTime;
        st.clientFuturesExecutionLevel = x.clientFuturesExecutionLevel;
        st.contractualDifference = x.contractualDifference;
        st.endTime = x.endTime;
        st.futuresPremium = x.futuresPremium;
        st.hedgeMonth = x.hedgeMonth;
        st.id = x.id;
        st.invoicePrice = x.invoicePrice;
        st.pricedLots = x.pricedLots;
        st.quantity = x.quantity;
        st.subTrancheChar = x.subTrancheChar;
        st.subTrancheNum = x.subTrancheNum;
        st.trancheNum = x.trancheNum;
        st.unpricedLots = x.unpricedLots;
        st.wap = x.wap;
        return st;
      }
    );

    return subTranches;
  }

  getAllData(): Combo {
    const futures = this.getFutures();
    const subTranche = this.getSubTranches();

    if (this.preSelectedFutureIds) {
      const f = futures.filter((x) => this.preSelectedFutureIds.includes(x.id));

      const subs = subTranche.filter((x) =>
        this.preSelectedSubTranches.includes(
          x.trancheNum.toString() + x.subTrancheChar
        )
      );

      attribute(f, subs, true);
    }

    return {
      futures: futures,
      subTranches: subTranche,
      priceAvgMode: 'Selected',
    };
  }
}

export interface Combo {
  futures: Future[];
  subTranches: SubTranche[];
  priceAvgMode: string;
}
