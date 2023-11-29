import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { Future, SubTranche } from './models';
import { PriceConfirmationService } from './price-confirmation.service';

@Component({
  selector: 'app-price-confirmation',
  templateUrl: './price-confirmation.component.html',
  styleUrls: ['./price-confirmation.component.css'],
})
export class PriceConfirmationComponent implements OnInit {
  constructor(
    public priceConfirmationService: PriceConfirmationService,
    private fb: FormBuilder
  ) {}

  console = console;

  trancheOptions = [
    ...new Set(
      this.priceConfirmationService.getSubTranches().map((x) => x.trancheNum)
    ),
  ];

  formSubTranches: FormGroup = new FormGroup({
    subTranches: this.fb.array<SubTranche>([]),
  });

  formFutures: FormGroup = new FormGroup({
    futures: this.fb.array<Future>([]),
  });

  formSelection: FormGroup = new FormGroup({
    selectedTranche: new FormControl<SubTranche[] | null>(null),
  });

  viewModel$ = this.priceConfirmationService.combinedStream$.pipe(
    map((combo) => {
      const futures = combo.futures;
      const subTranches = combo.subTranches;

      const arrF = futures.map((x) => toFuturesFormGroup(this.fb, x));
      this.formFutures.setControl('futures', this.fb.array(arrF));

      this.futuresFormArray.valueChanges.subscribe((futures: Future[]) => {
        const ids = futures
          .filter((x) => x.isSelected)
          .map((x: Future) => x.id);
        this.priceConfirmationService.selectionFutureChange(ids);
      });

      const arrSt = subTranches.map((x) => toSubTrancheFormGroup(this.fb, x));
      this.formSubTranches.setControl('subTranches', this.fb.array(arrSt));

      const vm = {
        subTrancheForm: this.formSubTranches,
        futuresForm: this.formFutures,
      };

      return vm;
    })
  );

  ngOnInit(): void {
    this.formSelection
      .get('selectedTranche')!
      .valueChanges.subscribe((tranches: number[]) => {
        this.priceConfirmationService.selectionSubTrancheChange(tranches);
      });
  }

  get subTrancheFormArray(): FormArray {
    return this.formSubTranches.get('subTranches') as FormArray;
  }

  get futuresFormArray(): FormArray {
    return this.formFutures.get('futures') as FormArray;
  }
}

const toSubTrancheFormGroup = (
  formBuilder: FormBuilder,
  subTranche: SubTranche
): FormGroup => {
  const fg = formBuilder.group<SubTranche>({
    ...subTranche,
  });
  return fg;
};

const toFuturesFormGroup = (
  formBuilder: FormBuilder,
  future: Future
): FormGroup => {
  const fg = formBuilder.group<Future>({
    ...future,
  });
  return fg;
};
