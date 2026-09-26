
/*
//    ---------------------------------------------------------
//    ---     AISuite typescript tools         ---
//    ---     Formula model presented to ui    ---
//    ---------------------------------------------------------
//
*/

import { LanguageTag } from './languagetag.model';

export class LanguageFormula {
  constructor(
    public formula: string,
    public lingua: string,
    public tags: LanguageTag[]
  ) { }
}
