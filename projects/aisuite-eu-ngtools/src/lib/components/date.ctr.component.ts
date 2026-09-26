import { Component, forwardRef, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ais-datectr-input',
    template: `
    <input type="date" class="form-control text-center" (keydown)="onKey($event)" [value]="cur" (input)="cur = $any($event.target).value"
            (blur)="validatecur(cur)" (focus)="touch()" [disabled]="disabled"
            [class.form-control-sm]="small" [placeholder]="placeholder" [required]="required" />
  `,
    styles: [],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateInputComponent),
            multi: true,
        }],
    changeDetection: ChangeDetectionStrategy.Eager
})
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ---     Date control component for AI Suite              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class DateInputComponent implements ControlValueAccessor {

  @Input() small = false;
  @Input() placeholder='';
  @Input() disabled = false;
  @Input() required = false;

  private innercur = '';
  private curval: Date|undefined;

  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }


  touch() {
    this.onTouched();
  }

  writeValue(val: Date): void {
    this.cur = this.display(val);
  }

  registerOnChange(fn: (val: Date|undefined) => void): void {
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
  validatecur(val: string) {
    this.verifycur(val);
    this.onTouched();
  }
  verifycur(value: string) {
    if (value === null) {
      this.curval = undefined;
    } else {
      this.curval = new Date(value);
    }
    if (!this.disabled) {
      this.onChange(this.curval);
    }
  }

  display(val: Date): string {
    let resp = '';
    if (val) {
      const objType = Object.prototype.toString.call(val);
      if (objType === '[object String]') {
          val = new Date(val);
      }
      try {
        const y = val.getFullYear();
        const m = val.getMonth() + 1;
        const d = val.getDate();
        resp = y + '-' + ('00' + m).slice(-2) + '-' + ('00' + d).slice(-2);
      } catch {
        resp = '';
      }
    }
    return resp;
  }

  onKey(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        // TODO : cycle through active components (event to app level)
        break;
      //case 'ArrowUp':
      //  const ndtu = new Date(this.curval);
      //  ndtu.setMonth(ndtu.getMonth() - 1);
      //  this.cur = this.display(ndtu);
      //  break;
      //case 'ArrowDown':
      //  const ndtd = new Date(this.curval);
      //  ndtd.setMonth(ndtd.getMonth() + 1);
      //  this.cur = this.display(ndtd);
      //  break;
      case 'ArrowLeft': {
        const ndtl = new Date(this.curval??'');
        ndtl.setDate(ndtl.getDate() - 1);
        this.cur = this.display(ndtl);
        break;
      }
      case 'ArrowRight': {
        const ndtr = new Date(this.curval??'');
        ndtr.setDate(ndtr.getDate() + 1);
        this.cur = this.display(ndtr);
        break;
      }
      case 'Tab':
        // TODO : cycle through active components (event to app level)
        break;
      default:
        break;
    }
  }

  private onChange: (val: Date|undefined) => void = () => undefined;
  private onTouched: () => void = () => undefined;

}
