
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
// After LanguageService.switchLingua, give the language to re-evaluate the pipe:
//    {{ '<tag name>' | linsceLocalisation: formula : currentLingua }}
@Pipe({
    name: 'linsceLocalisation'
})
export class LinScePipe implements PipeTransform {
  private repo = inject(LanguageService);

  // lingua is not used, it only makes the pure pipe run again when the language changes
  transform(tag: string, formula: string, lingua?: string): string {
    void lingua;
    return this.repo.label(formula, tag);
  }
}
