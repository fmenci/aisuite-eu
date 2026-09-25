
/*
//    ---------------------------------------------------------
//    ---     AISuite Project typescript tools         ---
//    ---     Time delay directive    ---
//    ---------------------------------------------------------
//
// trigger an event event on object change. emit object in new state
*/

import { Directive, EventEmitter, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';

export const UI_DELAY = 250; // milliseconds default value for timedelay event

/**
 * T = Type générique (optionnel) de l'EventEmitter
 *
 * Déclarer TimeDelayDirective dans une classe :
 * private delay: TimeDelayDirective<T> = new TimeDelayDirective<T>(delayInMsDefaultingTo250); ('T' optionnel)
 *
 * Appeler doWhatever à la fin du délai :
 * constructor(...) {
 *    delay.event.subscribe((obj: T) => this.doWhatever(obj)); ('obj' optionnel)
 * }
 *
 * Démarrer le délai :
 * this.delay.tima(obj); ('obj' optionnel)
 * */
@Directive()
export class TimeDelayDirective<T = undefined> {

  @Output() event: EventEmitter<T> = new EventEmitter<T>();
  private triggerSubscribe: Subscription | undefined;

  // not an injectable, the delay is given by the caller: new TimeDelayDirective(ms)
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private msDelay: number = UI_DELAY) { }

  public tima(eventEmittedValue?: T) {
    if (this.triggerSubscribe) {
      this.triggerSubscribe.unsubscribe();
    }
    this.triggerSubscribe = interval(this.msDelay)
      .subscribe(() => {
        this.event.emit(eventEmittedValue);
        if (this.triggerSubscribe !== undefined) {
          this.triggerSubscribe.unsubscribe();
        }
      });
  }
}
