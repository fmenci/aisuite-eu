
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

import { Currency } from './currency.enum';

export class CurrencyConversionModel {
  constructor(
    public curfrom?: Currency,
    public curto?: Currency,
    public ondate?: Date,
    public amount?: number,
    public verified = false
  ) {}
}
