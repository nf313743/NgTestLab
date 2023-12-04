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

  private priceAvgMethodSubject = new BehaviorSubject<PriceAverageMethod>(
    PriceAverageMethod.Fifo
  );
  priceAvgMethodStream$ = this.priceAvgMethodSubject.asObservable();

  combinedStream$: Observable<Combo> = combineLatest([
    this.futureStream$,
    this.subTrancheStream$,
    this.selectionTrancheStream$,
    this.selectionFutureStream$,
    this.priceAvgMethodStream$,
  ]).pipe(
    map(
      ([
        futures,
        subTranches,
        selectedSubTranches,
        selectedFutures,
        priceAvgMethod,
      ]) => {
        const futuresCopy = futures.map((x) => Object.assign({}, x));
        futuresCopy.forEach((x) => {
          if (selectedFutures?.includes(x.id)) x.isSelected = true;
        });

        const subTrancheCopy = subTranches.map((x) => x.clone());

        selectedSubTranches!.forEach((id) => {
          const foo = subTrancheCopy.filter((x) => x.id === id)!;
          foo.forEach((x) => (x.isSelected = true));
        });

        if (this.anyItemsSelected(selectedFutures, selectedSubTranches))
          return {
            futures: futuresCopy,
            subTranches: subTrancheCopy,
            priceAvgMethod: priceAvgMethod,
          } as Combo;

        const selectedFuturesCopy = futuresCopy.filter((x) => x.isSelected)!;

        unAttribute(selectedFuturesCopy, subTrancheCopy);

        attribute(selectedFuturesCopy, subTrancheCopy, priceAvgMethod);

        return {
          futures: futuresCopy,
          subTranches: subTrancheCopy,
          priceAvgMethod: priceAvgMethod,
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

  emitPriceAvg(value: PriceAverageMethod) {
    this.priceAvgMethodSubject.next(value);
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
        st.begTime = x.begTime.substring(0, 10);
        st.clientFuturesExecutionLevel = x.clientFuturesExecutionLevel;
        st.contractualDifference = x.contractualDifference;
        st.endTime = x.endTime.substring(0, 10);
        st.futuresPremium = x.futuresPremium;
        st.hedgeMonth = x.hedgeMonth.substring(0, 10);
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

      const subs = subTranche
        .filter((x) =>
          this.preSelectedSubTranches.includes(
            x.trancheNum.toString() + x.subTrancheChar
          )
        )
        .map((x) => {
          x.isSelected = true;
          return x;
        });

      attribute(f, subs, PriceAverageMethod.Selected);
    }

    return {
      futures: futures,
      subTranches: subTranche,
      priceAvgMethod: PriceAverageMethod.Selected,
    };
  }

  private anyItemsSelected(
    selectedFutures: number[],
    selectedTranches: number[]
  ) {
    return selectedFutures.length === 0 || selectedTranches.length === 0;
  }
}

export interface Combo {
  futures: Future[];
  subTranches: SubTranche[];
  priceAvgMethod: PriceAverageMethod;
}

export enum PriceAverageMethod {
  Fifo,
  Selected,
  Contract,
}
