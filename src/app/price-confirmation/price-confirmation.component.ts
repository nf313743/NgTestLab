import { Component, OnInit } from '@angular/core';
import { PriceConfirmationService } from './price-confirmation.service';
import { FormControl, FormGroup } from '@angular/forms';
import { SubTranche } from './models';

@Component({
  selector: 'app-price-confirmation',
  templateUrl: './price-confirmation.component.html',
  styleUrls: ['./price-confirmation.component.css'],
})
export class PriceConfirmationComponent implements OnInit {
  constructor(public priceConfirmationService: PriceConfirmationService) {}

  subTrancheOptions = this.priceConfirmationService
    .getSubTranches()
    .map((x) => ({
      id: x.id,
      subTrancheDisplay: x.subTrancheDisplay,
    }));

  formGroup: FormGroup = new FormGroup({
    selectedSubTranche: new FormControl<SubTranche[] | null>(null),
  });

  ngOnInit(): void {
    // Listen to when a value on the drop down changes.
    // The value will either be empty or a collection of subtranches
    // If empty, restore unmodified Sub-Tranche values
    // If there are items in the collection, do the calc.

    this.formGroup
      .get('selectedSubTranche')!
      .valueChanges.subscribe(
        (selectedSubTranche: { id: number; subTrancheDisplay: string }[]) => {
          const ids = selectedSubTranche.map((x) => x.id);
          this.priceConfirmationService.selectionChange(ids);
        }
      );
  }
}
