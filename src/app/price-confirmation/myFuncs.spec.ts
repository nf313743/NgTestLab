import { Future, SubTranche } from './models';
import { attribute } from './myFuncs';

describe('attribute', () => {
  it('Sub-Tranche should be fully priced', () => {
    const futures = getFutures();
    const subTranches = getSubTranches();

    attribute(futures, subTranches);

    expect(futures.length).toBe(4);

    const f1 = futures[0];
    expect(f1.lots).toBe(6);
    expect(f1.allocatedTo).toBe('1A');

    const f2 = futures[1];
    expect(f2.id).toBe(-1); // This is the split
    expect(f2.lots).toBe(3);
    expect(f2.allocatedTo).toBe('1B');

    const f3 = futures[2];
    expect(f3.lots).toBe(4);
    expect(f3.allocatedTo).toBe('1B');

    const f4 = futures[3];
    expect(f4.lots).toBe(4);
    expect(f4.allocatedTo).toBe('1B');

    const sub1 = subTranches[0];
    expect(sub1.unpricedLots).toBe(0);

    const sub2 = subTranches[1];
    expect(sub2.unpricedLots).toBe(34);
  });

  function getFutures(): Future[] {
    const futures: Future[] = [
      {
        id: 1,
        lots: 9,
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

  function getSubTranches(): SubTranche[] {
    const subTranches: SubTranche[] = [
      {
        isSelected: false,
        id: 1,
        clientFuturesExecutionLevel: 7,
        contractualDifference: 7,
        futuresPremium: 4,
        invoicePrice: 4,
        pricedLots: 5,
        quantity: 45,
        subTrancheChar: '1A',
        subTrancheNum: 1,
        trancheNum: 1,
        unpricedLots: 6,
        wap: 54353,
      },
      {
        isSelected: false,
        id: 2,
        clientFuturesExecutionLevel: 7,
        contractualDifference: 7,
        futuresPremium: 4,
        invoicePrice: 4,
        pricedLots: 5,
        quantity: 45,
        subTrancheChar: '1B',
        subTrancheNum: 2,
        trancheNum: 1,
        unpricedLots: 45,
        wap: 54353,
      },
      {
        isSelected: false,
        id: 3,
        clientFuturesExecutionLevel: 7,
        contractualDifference: 7,
        futuresPremium: 4,
        invoicePrice: 4,
        pricedLots: 5,
        quantity: 45,
        subTrancheChar: '2A',
        subTrancheNum: 1,
        trancheNum: 2,
        unpricedLots: 45,
        wap: 54353,
      },
    ];

    return subTranches;
  }
});
