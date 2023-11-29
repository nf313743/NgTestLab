import { Future, SubTranche } from './models';

export function attribute(futures: Future[], subTranches: SubTranche[]) {
  for (let i = 0; i < futures.length; i++) {
    const f = futures[i];

    if (!f.isSelected) continue;

    subTranches.forEach((st) => {
      if (f.isAllocated) return;

      // Check if there is still something price
      if (st.unpricedLots > 0) {
        const remainingLots = st.unpricedLots - f.lots;
        // remainingLots = 6 - 9 -> 3 needs to be split off

        // If remainingLots is > 0 you know the f.lots fits into it
        if (remainingLots >= 0) {
          // then we can apply this
          f.isAllocated = true;
          f.allocatedTo =
            (f.allocatedTo ?? '') + st.trancheNum + st.subTrancheChar;
          st.unpricedLots = st.unpricedLots - f.lots;
          st.pricedLots = st.pricedLots + f.lots;
        } else {
          // We have to split the Future

          f.lots = st.unpricedLots;
          const newFuture: Future = {
            ...f,
            id: -1,
            lots: Math.abs(remainingLots),
            splitFrom: f.id,
          };
          st.unpricedLots = 0;
          st.pricedLots = st.pricedLots + f.lots;
          f.isAllocated = true;
          f.allocatedTo =
            (f.allocatedTo ?? '') + st.trancheNum + st.subTrancheChar;

          // Insert the new future as the next item in the array
          futures.splice(i + 1, 0, newFuture);
        }
      }

      /*** Running calcs ****/

      const futuresAppliedToSubTranche = futures.filter((x) =>
        x.allocatedTo?.includes(st.subTrancheChar)
      );

      const clientFuturesExecutionLevel = calcWap(
        futuresAppliedToSubTranche,
        (x) => x.futuresPriceWithOffset
      );

      var zFeesAmount = st.contractualDifference; // ?

      const invoicePrice = clientFuturesExecutionLevel + zFeesAmount;

      st.wap = calcWap(futuresAppliedToSubTranche, (x) => x.price);
      st.clientFuturesExecutionLevel = st.contractualDifference = zFeesAmount;
      st.invoicePrice = invoicePrice;
    });
  }
}

function calcWap(futures: Future[], priceFn: (arg: Future) => number): number {
  const denominator = futures.reduce((acc, next) => acc + next.lots, 0);

  if (denominator === 0) return 0;

  const wap = Math.abs(
    futures.reduce(
      (acc, next) => acc + next.lots * priceFn(next) * next.ccyMultiplier,
      0
    ) / futures.reduce((acc, next) => acc + next.lots, 0)
  );

  return wap;
}
