import { Component, forwardRef, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { decimalPoint } from '../decimal.point';


@Component({
    selector: 'ais-numeral-input',
    template: `
    <input type="text" class="form-control text-end" (keydown)="onKey($event)" [value]="cur" (input)="cur = $any($event.target).value"
          (blur)="validatecur(cur)" (focus)="touch()" [disabled]="disabled" [class.form-control-sm]="small" [placeholder]="placeholder" />
  `,
    styles: [],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NumeralInputComponent),
            multi: true,
        }],
    changeDetection: ChangeDetectionStrategy.Eager
})
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ---     Numeral selector Angular Project  ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class NumeralInputComponent implements ControlValueAccessor {

  @Input() doppo = 2;
  @Input() storedp = 1;
  @Input() small = false;
  @Input() placeholder = '';
  @Input() disabled = false;

  private innercur = '0';
  private curval = 0;

  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }


  touch() {
    this.onTouched();
  }

  writeValue(val: number): void {
    this.cur = this.display(val);
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get cur(): string {
    return this.innercur;
  }

  set cur(value: string) {
    this.innercur = value;
    this.verifycur(value);
  }

  validatecur(value: string) {
    this.verifycur(value);
    this.onTouched();
  }

  verifycur(value: string) {
    let pf = 0;
    if (value !== null) {
      pf = Number(value);
      if (isNaN(pf)) {
        pf = parseFloat(value.replace(/\s/g, '').replace(decimalPoint(), '.'));
      }
    }
    this.curval = pf;
    pf = this.canonicalnumber(pf);
    if (!this.disabled) {
      this.onChange(pf);
    }
  }

  canonicalnumber(value: number): number {
    let fv = 0;
    if (value) {
      const nbsig = this.doppo + this.storedp;
      fv = Number(Math.round(Number(value + 'e' + nbsig)) + 'e-' + nbsig);
    }
    return fv;
  }

  display(value: number): string {
    let fv = '0';
    if (value) {
      fv = value.toFixed(this.doppo).toString().replace('.', decimalPoint());
    }
    return fv;
  }

  onKey(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        // TODO : cycle through active components (event to app level)
        break;
      case 'ArrowLeft':
        this.cur = this.display(--this.curval);
        break;
      case 'ArrowRight':
        this.cur = this.display(++this.curval);
        break;
      case 'Tab':
        // TODO : cycle through active components (event to app level)
        break;
      default:
        break;
    }
  }

  private onChange: (val: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

}
