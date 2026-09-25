import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { TimeDelayDirective } from './timedelay.directive';

@Directive()
@Injectable()
/*
//    ---------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools           ---
//    ---------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class ExportXMLDirective {
  @Output() closed = new EventEmitter();
  public opened: TimeDelayDirective<boolean> = new TimeDelayDirective<boolean>();

  public open(show: boolean) {
    this.opened.tima(show);
  }
  public close() {
    this.closed.emit();
  }
}
