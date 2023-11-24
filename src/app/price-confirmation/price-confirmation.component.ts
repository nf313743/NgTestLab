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

  ngOnInit(): void {}
}
