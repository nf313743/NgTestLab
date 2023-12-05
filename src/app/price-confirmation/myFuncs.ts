import { Future, PriceAvgValues, SubTranche } from './models';
import { PriceAverageMethod } from './price-confirmation.service';

export function attribute(
  futures: Future[],
  subTranches: SubTranche[],
  priceAvgMethod: PriceAverageMethod
) {
  for (let i = 0; i < futures.length; i++) {
    const f = futures[i];

    // Need this here because we need to mutate the list past in.
    if (!f.isSelected) continue;

    subTranches
      .filter((x) => x.isSelected)
      .forEach((st) => {
        if (f.isAllocated) return;

        // Check if there is still something price
        if (st.unpricedLots > 0) {
          const remainingLots = st.unpricedLots - f.lots;
          // remainingLots = 6 - 9 -> 3 needs to be split off

          // If remainingLots is > 0 you know the f.lots fits into it
          if (remainingLots >= 0) {
            // then we can apply this
            st.addFuture(f);
          } else {
            // We have to split the Future

            f.lots = st.unpricedLots;
            const newFuture: Future = {
              ...f,
              id: -1,
              lots: Math.abs(remainingLots),
              splitFrom: f.id,
              isAllocated: false,
              isSelected: true,
            };

            st.addFuture(f);

            // Insert the new future as the next item in the array
            futures.splice(i + 1, 0, newFuture);
          }
        }
      });
  }

  if (priceAvgMethod === PriceAverageMethod.Selected) {
    priceAverageSelected(subTranches);
  } else if (priceAvgMethod === PriceAverageMethod.Contract) {
    priceAverageContract(subTranches);
  }
}

export function unAttribute(futures: Future[], subTranches: SubTranche[]) {
  // For each future remove from existing.  They can always be re-added after.

  const selectedFutures = futures.filter((x) => x.isSelected);

  subTranches.forEach((st) => {
    selectedFutures.forEach((f) => {
      st.removeFuture(f);
    });
  });

  selectedFutures.forEach((f) => {
    f.isAllocated = false;
    f.allocatedTo = '';
  });
}

function priceAverageSelected(subTranches: SubTranche[]): void {
  const selectedSubTranches = subTranches.filter((x) => x.isSelected);

  const futures = selectedSubTranches.flatMap((st) => st.futures);

  const wap = calcWap(futures, (x) => x.price);
  const clientFuturesExecutionLevel = calcWap(
    futures,
    (x) => x.futuresPriceWithOffset
  );

  const values: PriceAvgValues = {
    clientFuturesExecutionLevel: clientFuturesExecutionLevel,
    wap: wap,
  };

  selectedSubTranches.forEach((st) => {
    st.setFromPriceAvg(values);
  });
}

function priceAverageContract(subTranches: SubTranche[]): void {
  const futures = subTranches.flatMap((st) => st.futures);

  const attributedSubTranches = subTranches.filter((x) => x.futures.length > 0);

  const wap = calcWap(futures, (x) => x.price);
  const clientFuturesExecutionLevel = calcWap(
    futures,
    (x) => x.futuresPriceWithOffset
  );

  const values: PriceAvgValues = {
    clientFuturesExecutionLevel: clientFuturesExecutionLevel,
    wap: wap,
  };

  attributedSubTranches.forEach((st) => {
    st.setFromPriceAvg(values);
  });
}

export function calcWap(
  futures: Future[],
  priceFn: (arg: Future) => number
): number {
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
