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

  subTrancheOptions = this.priceConfirmationService
    .getSubTranches()
    .map((x) => ({
      id: x.id,
      subTrancheDisplay: x.subTrancheDisplay,
    }));

  formSubTranches: FormGroup = new FormGroup({
    subTranches: this.fb.array<SubTranche>([]),
  });

  formSelection: FormGroup = new FormGroup({
    selectedSubTranche: new FormControl<SubTranche[] | null>(null),
  });

  viewModel$ = this.priceConfirmationService.combinedStream$.pipe(
    map((sts) => {
      const arr = sts.map((x) => toFormGroup(this.fb, x));
      this.formSubTranches.setControl('subTranches', this.fb.array(arr));

      const vm = {
        form: this.formSubTranches,
      };

      return vm;
    })
  );

  ngOnInit(): void {
    this.formSelection
      .get('selectedSubTranche')!
      .valueChanges.subscribe(
        (selectedSubTranche: { id: number; subTrancheDisplay: string }[]) => {
          const ids = selectedSubTranche.map((x) => x.id);
          this.priceConfirmationService.selectionChange(ids);
        }
      );
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
