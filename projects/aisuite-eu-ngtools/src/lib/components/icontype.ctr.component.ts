import { Component, forwardRef, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconTypeEnum } from '../models/icontype.enum';

@Component({
    selector: 'ais-icontype-input',
    template: `
    <select class="form-control text-end" (keydown)="onKey($event)"
      (change)="cur = $any($event.target).value; validatecur(cur)" (focus)="touch()" [disabled]="disabled" [class.form-control-sm]="small">
      @for (key of keys; track key) {
        <option [value]="key" [selected]="key === cur">{{ fetchEnumElement(key) }}</option>
      }
    </select>
    `,
    styles: [],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IconTypeInputComponent),
            multi: true,
        }],
    changeDetection: ChangeDetectionStrategy.Eager
})
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class IconTypeInputComponent implements ControlValueAccessor {
  @Input() small = false;
  @Input() disabled = false;

  icontypes = IconTypeEnum;
  keys: string[] = [];

  private innercur = '0';
  private curval = 0;

  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }
  constructor() {
    this.keys = Object.keys(this.icontypes).filter(k => !isNaN(Number(k)));
  }
  touch() {
    this.onTouched();
  }
  writeValue(val: number | null | undefined): void {
    this.cur = this.display(val);
  }
  registerOnChange(fn: (rating: number) => void): void {
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
      pf = parseInt(value, 10);
      if (isNaN(pf)) {
        pf = 0;
      }
    }
    this.curval = pf;
    if (!this.disabled) {
      this.onChange(pf);
    }
  }
  display(value: number | null | undefined): string {
    return (value ?? 0).toString();
  }
  onKey(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        // TODO : cycle through active components (event to app level)
        break;
      //case 'ArrowUp':
      //  if (this.curval > 0) {
      //    this.cur = this.display(--this.curval);
      //  } else {
      //    this.cur = this.display(0);
      //  }
      //  break;
      //case 'ArrowDown':
      //  if (this.curval < (this.keys.length - 1)) {
      //    this.cur = this.display(++this.curval);
      //  } else {
      //    this.cur = this.display(this.keys.length - 1);
      //  }
      //  break;
      //case 'ArrowLeft':
      //  this.cur = this.display(0);
      //  break;
      //case 'ArrowRight':
      //  this.cur = this.display(this.keys.length - 1);
      //  break;
      case 'Tab':
        // TODO : cycle through active components (event to app level)
        break;
      default:
        break;
    }
  }
  fetchEnumElement(uskey: string): string {
    return (this.icontypes as Record<string, unknown>)[uskey] as string;
  }
  private onChange: (val: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

}
