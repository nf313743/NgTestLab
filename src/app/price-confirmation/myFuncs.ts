import { Future, SubTranche } from './models';

export function attribute(futures: Future[], subTranches: SubTranche[]) {
  for (let i = 0; i < futures.length; i++) {
    const f = futures[i];

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
          f.allocatedTo = (f.allocatedTo ?? '') + st.subTrancheDisplay;
          st.unpricedLots = st.unpricedLots - f.lots;
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

          f.isAllocated = true;
          f.allocatedTo = (f.allocatedTo ?? '') + st.subTrancheDisplay;

          // Insert the new future as the next item in the array
          futures.splice(i + 1, 0, newFuture);
        }
      }
    });
  }
}
