import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, forwardRef, HostBinding, HostListener, Input, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ILinguaFlag } from '../models/ilingua.flag';
import { DEFAULT_FLAG, LanguageService } from '../services/language.service';

@Component({
    selector: 'ais-lingua-selector',
    templateUrl: './lingua.control.component.html',
    styleUrls: [],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LinguaControlComponent),
            multi: true,
        }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, NgStyle]
})

/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ---     Lingua flag selector  ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

export class LinguaControlComponent implements ControlValueAccessor, OnDestroy {
  private _el = inject(ElementRef);
  private flagrepo = inject(LanguageService);

  @Input() small = false;
  @Input() itemid = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() trim0 = false;
  @Input() onlyValidLinguas: string[] = [];

  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }
  _curflag: ILinguaFlag | undefined;
  public visible = false;
  public visibleAnimate = false;
  public maxh = 4000;

  private preventRebound = false;
  private subscriptions: Subscription[] = [];

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  writeValue(val: string): void {
    this.itemid = val;
    const flag = this.flagrepo.getFlag(val);
    if (flag !== undefined) {
      this._curflag = flag;
    }
    this.onChange(this.itemid);
  }

  registerOnChange(fn: (rating: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  gpClass(): string {
    let cl = 'list-group-item text-start';
    if (this.small) {
      cl += ' py-0';
    } else {
      cl += ' py-1';
    }
    return cl;
  }

  pushlingua(obj: ILinguaFlag) {
    this.hide();
    if (!this.disabled) {
      if (this.itemid !== obj.name) {
        this.onChange(obj.name);
        this.itemid = obj.name;
      }
      if (obj !== undefined) {
        this._curflag = obj;
      }
    }
    this.onTouched();
  }

  get linguas(): ILinguaFlag[] {
    if (this.onlyValidLinguas.length > 0) {
      return this.flagrepo.linguas.filter((flag: ILinguaFlag) => this.onlyValidLinguas.find(tm => tm === flag.name));
    }
    else if (this.trim0 === true) {
      return this.flagrepo.lintrim00;
    }
    else {
      return this.flagrepo.linguas;
    }
  }

  get disabledleaf() {
    if (this.linguas === undefined) {
      return true;
    }
    return this.disabled || this.linguas.length < 2;
  }

  public show(): void {
    if (this.disabled) {
      return;
    }
    const domrec = this._el.nativeElement.getBoundingClientRect();
    const vl = window.innerHeight - Math.ceil(domrec.top) - 60;
    if (vl > 200) {
      this.maxh = vl;
    } else {
      this.maxh = 200;
    }
    this.onTouched();
    this.preventRebound = true;
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
    setTimeout(() => this.preventRebound = false, 750);
  }

  public hide(): void {
    if (!this.preventRebound) {
      this.visibleAnimate = false;
      setTimeout(() => {
        this.visible = false;
      }, 300);
    }
  }

  @HostListener('document:click', ['$event'])
  onExternalClick(event: MouseEvent): void {
    if (!this._el.nativeElement.contains(event.target)) {
      setTimeout(() => {
        if (!this.preventRebound) {
          this.hide();
        }
      }, 350);
    }
  }

  get macheigth(): string {
    return this.maxh + 'px';
  }

  get currentflag(): ILinguaFlag {
    if (this._curflag !== undefined) {
      return this._curflag;
    }
    return DEFAULT_FLAG;
  }

  private onChange: (val: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

}
