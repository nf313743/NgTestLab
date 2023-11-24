import { Injectable } from '@angular/core';
import { Future, SubTranche } from './models';

@Injectable({
  providedIn: 'root',
})
export class PriceConfirmationService {
  constructor() {}

  getFutures(): Future[] {
    const futures: Future[] = [
      {
        id: 1,
        lots: 4,
        price: 45.6,
      },
      {
        id: 2,
        lots: 4,
        price: 45.6,
      },
      {
        id: 3,
        lots: 4,
        price: 45.6,
      },
    ];

    return futures;
  }

  getSubTranches(): SubTranche[] {
    const subTranches: SubTranche[] = [
      {
        id: 1,
        lots: 5,
        price: 678.4,
        subTrancheDisplay: '1A',
        subTrancheNum: 1,
        trancheNum: 1,
      },
      {
        id: 2,
        lots: 5,
        price: 678.4,
        subTrancheDisplay: '1B',
        subTrancheNum: 2,
        trancheNum: 1,
      },
      {
        id: 3,
        lots: 5,
        price: 678.4,
        subTrancheDisplay: '2A',
        subTrancheNum: 1,
        trancheNum: 2,
      },
    ];

    return subTranches;
  }
}
