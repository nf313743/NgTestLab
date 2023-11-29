import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PriceConfirmationComponent } from './price-confirmation/price-confirmation.component';

@NgModule({
  declarations: [AppComponent, PriceConfirmationComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MultiSelectModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ButtonModule,
    TableModule,
    CheckboxModule,
    SplitButtonModule,
    ToastModule,
    MessagesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
