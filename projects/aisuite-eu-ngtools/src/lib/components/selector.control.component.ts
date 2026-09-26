import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, forwardRef, HostBinding, HostListener, Input, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AISuiteCoreListItemModel } from '../models/aisuitecore.listitem.model';
import { AisuiteSelectModel } from '../models/aisuiteselect.model';
import { LivelyListDirective } from '../services/livelylist.directive';
import { TimeDelayDirective } from '../services/timedelay.directive';

@Component({
    selector: 'ais-control-selector',
    templateUrl: './selector.control.component.html',
    styleUrls: [],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectorControlComponent),
            multi: true,
        }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, NgStyle]
})
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ---     Select in predefined list  ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class SelectorControlComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private livelylist = inject(LivelyListDirective);
  private _el = inject(ElementRef);

  @Input() listname = 'ListEntities';
  @Input() small = false;
  @Input() itemid = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() set parentid(value: string) {
    this._parentid = value;
    this.triggerlist();
  }
  get parentid(): string {
    return this._parentid;
  }
  itemname = '';
  bulist: AISuiteCoreListItemModel[] = [];
  public visible = false;
  public visibleAnimate = false;
  public maxh = 4000;

  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }

  private _parentid = '';
  private preventRebound = false;
  private subscriptions: Subscription[] = [];
  private trigger: TimeDelayDirective<AisuiteSelectModel> = new TimeDelayDirective<AisuiteSelectModel>();

  constructor() {
    this.subscriptions.push(this.livelylist.evRefresh.subscribe((obj: AisuiteSelectModel) => {
      this.readBusinessList(obj);
    }));
    this.subscriptions.push(this.trigger.event.subscribe((obj: AisuiteSelectModel) => {
      this.livelylist.pulllist(obj);
    }));
  }

  ngOnInit() {
    this.triggerlist();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  writeValue(val: string): void {
    this.itemid = val;
    if (this.bulist !== undefined) {
      this.refreshdisplay(val);
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

  readBusinessList(result: AisuiteSelectModel) {
    if ((result.name === this.listname) && (result.unicId === this.parentid) && (result.listdata !== undefined)) {
      this.bulist = result.listdata;
      if (this.bulist.length === 1) {
        this.userpush(this.bulist[0]);
      } else if ((this.itemid !== undefined) && (this.itemid !== null)) {
        this.refreshdisplay(this.itemid);
      } else {
        this.itemname = '';
      }
    }
  }

  gpClass(itm: AISuiteCoreListItemModel): string {
    let cl = 'list-group-item';
    if (this.small) {
      cl += ' py-0';
    } else {
      cl += ' py-1';
    }
    if (itm.cssClass !== '') {
      cl += ' ';
      cl += itm.cssClass;
    }
    return cl;
  }

  userpush(obj: AISuiteCoreListItemModel) {
    this.hide();
    if (!this.disabled) {
      if ((obj.id !== undefined) && (this.itemid !== obj.id)) {
        this.onChange(obj.id);
        this.itemid = obj.id;
      }
      this.itemname = obj.name ?? '-';
    }
    this.onTouched();
  }

  get presetList(): AISuiteCoreListItemModel[] {
    if (this.bulist !== undefined) {
      return this.bulist.filter(tm => tm.isPresel === true);
    }
    return [];
  }

  get showpresel(): boolean {
    return this.presetList.length > 0 && this.presetList.length < this.bulist.length;
  }

  get disabledleaf() {
    if (this.bulist === undefined) {
      return true;
    }
    return this.disabled || this.bulist.length < 2;
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

  private refreshdisplay(id: string) {
    const obj = this.bulist.filter(tm => tm.id === id);
    if (obj.length > 0) {
      this.itemname = obj[0].name ?? '-';
    } else {
      this.userpush(new AISuiteCoreListItemModel());
    }
  }

  private triggerlist() {
    this.bulist = [];
    if ((this.parentid !== undefined) && (this.parentid !== null)) {
      this.trigger.tima(new AisuiteSelectModel(this.listname, this.parentid, new Date(), []));
    }
  }
  private onChange: (val: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

}
