
/*
//    ---------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools           ---
//    ---------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from './language.service';

// How to use :
//    {{ '<tag name>' | linsceLocalisation: formula }}
@Pipe({
    name: 'linsceLocalisation'
})
export class LinScePipe implements PipeTransform {
  private repo = inject(LanguageService);

  transform(tag: string, formula: string): string {
    return this.repo.label(formula, tag);
  }
}
