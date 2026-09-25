import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EMPTYGUID } from '../../public-api';
import { AISuiteCoreListItemModel } from '../models/aisuitecore.listitem.model';
import { AisuiteSelectModel } from '../models/aisuiteselect.model';
import { LivelyListDirective } from '../services/livelylist.directive';
import { TimeDelayDirective } from '../services/timedelay.directive';

@Component({
    selector: 'ais-aicontrol-list',
    templateUrl: './aicontrol.list.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, NgStyle, ReactiveFormsModule]
})
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ---     Control list component, fetch owing to listname  ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class AiControlListComponent implements OnInit, OnDestroy {
  private rootFormGroup = inject(FormGroupDirective);
  private _el = inject(ElementRef);
  private livelylist = inject(LivelyListDirective);

  @Input() listname = '';
  @Input() formGroupName = '';
  @Input() placeholder = '';
  @Input() small = false;
  @Input() disabled = false;

  bulist: AISuiteCoreListItemModel[] = [];
  aiForm: FormGroup = new FormGroup({
    unicId: new FormControl(),
    name: new FormControl()
  });
  public visible = false;
  public visibleAnimate = false;
  public maxh = 4000;

  private preventRebound = false;
  private preventblurredupdate = false;
  private keyupev: TimeDelayDirective<string> = new TimeDelayDirective<string>();
  private trigger: TimeDelayDirective<AisuiteSelectModel> = new TimeDelayDirective<AisuiteSelectModel>();
  private keyfilter = '';

  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }
  private subscriptions: Subscription[] = [];

  constructor() {
    this.subscriptions.push(this.livelylist.evRefresh.subscribe((obj: AisuiteSelectModel) => {
      this.readBusinessList(obj);
    }));
    this.subscriptions.push(this.keyupev.event.subscribe((inp: string) => {
      this.show();
      this.keyfilter = inp;
    }));
    this.subscriptions.push(this.trigger.event.subscribe((obj: AisuiteSelectModel) => {
      this.livelylist.pulllist(obj);
    }));
  }

  ngOnInit() {
    this.aiForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.triggerlist();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  readBusinessList(result: AisuiteSelectModel) {
    if ((result.name === this.listname) && (result.listdata !== undefined)) {
      this.bulist = result.listdata;
      if (this.bulist.length === 1) {
        this.userpush(this.bulist[0]);
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
    if (this.disabled) {
      this.hide();
      return;
    }
    this.preventblurredupdate = true;
    this.aiForm.patchValue({
      unicId: obj.id,
      name: obj.name
    });
    this.hide();
    this.preventblurredupdate = false;
  }

  show(): void {
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
    this.preventRebound = true;
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
    setTimeout(() => this.preventRebound = false, 750);
  }

  hide(): void {
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

  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.update();
    }
    if (!this.disabled) {
      this.keyupev.tima((event.target as HTMLInputElement).value);
    }
  }

  update() {
    if (!this.disabled && !this.preventblurredupdate) {
      let id = EMPTYGUID;
      if (this.bulist !== undefined) {
        const ctrname = this.aiForm!.get('name') as FormControl;
        const testv = ctrname.value.toLocaleLowerCase();
        const reply: AISuiteCoreListItemModel[] = [];
        this.bulist.forEach(tm => {
          const butest = (tm.name ?? '').toLocaleLowerCase();
          if (butest === testv) {
            reply.push(tm);
          }
        });
        if (reply.length > 0) {
          id = reply[0].id ?? '';
        }
      }
      this.aiForm.patchValue({
        unicId: id
      });
    }
  }

  get mxheigth(): string {
    return this.maxh + 'px';
  }

  get showpresel(): boolean {
    return this.presetList.length > 0;
  }

  get filteredlist(): AISuiteCoreListItemModel[] {
    if (this.bulist !== undefined) {
      let reply: AISuiteCoreListItemModel[] = [];
      if (this.keyfilter.length > 2) {
        const testv = this.keyfilter.toLocaleLowerCase();
        this.bulist.forEach(tm => {
          const butest = (tm.name ?? '').toLocaleLowerCase();
          if (butest.indexOf(testv) >= 0) {
            reply.push(tm);
          }
        });
      }
      if (reply.length === 0) {
        reply = this.bulist;
      }
      return reply;
    }
    return [];
  }

  get presetList(): AISuiteCoreListItemModel[] {
    return this.filteredlist.filter(tm => tm.isPresel === true);
  }

  private triggerlist() {
    this.bulist = [];
    this.trigger.tima(new AisuiteSelectModel(this.listname, '', new Date(), []));
  }

}
