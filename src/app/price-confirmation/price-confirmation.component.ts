import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { SubTranche } from './models';
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

  formSelection: FormGroup = new FormGroup({
    selectedTranche: new FormControl<SubTranche[] | null>(null),
  });

  viewModel$ = this.priceConfirmationService.combinedStream$.pipe(
    map((combo) => {
      const futures = combo.futures;
      const subTranches = combo.subTranches;

      const arr = subTranches.map((x) => toFormGroup(this.fb, x));
      this.formSubTranches.setControl('subTranches', this.fb.array(arr));

      const vm = {
        form: this.formSubTranches,
        futures: futures,
      };

      return vm;
    })
  );

  ngOnInit(): void {
    this.formSelection
      .get('selectedTranche')!
      .valueChanges.subscribe((tranches: number[]) => {
        this.priceConfirmationService.selectionChange(tranches);
      });
  }

  get subTrancheFormArray(): FormArray {
    return this.formSubTranches.get('subTranches') as FormArray;
  }
}

const toFormGroup = (
  formBuilder: FormBuilder,
  subTranche: SubTranche
): FormGroup => {
  const fg = formBuilder.group<SubTranche>({
    ...subTranche,
  });
  return fg;
};
