import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IconDtoModel } from '../models/icondto.model';
import { IconTypeEnum } from '../models/icontype.enum';
import { IconTypeInputComponent } from './icontype.ctr.component';

@Component({
    selector: 'ais-icon-selector',
    templateUrl: './iconselector.control.component.html',
    styleUrls: ['./iconselector.control.component.less'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, IconTypeInputComponent]
})

/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ---     Icon selector  ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

export class IconSelectorControlComponent implements OnChanges, OnInit, OnDestroy {
  private rootFormGroup = inject(FormGroupDirective);

  @Input() metamodel: IconDtoModel | undefined;
  @Input() formGroupName = '';
  @Output() formReady = new EventEmitter<FormGroup>();
  @Input() small = false;
  aiForm: FormGroup = new FormGroup({
    iconType: new FormControl(0),
    iconValue: new FormControl(),
    iconTitle: new FormControl()
  });
  private preventrecursion = false;
  private subscriptions: Subscription[] = [];
  ngOnInit() {
    this.aiForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    if (this.metamodel !== undefined) {
      this.aiForm.patchValue({
        iconType: this.metamodel.iconType,
        iconValue: this.metamodel.iconValue,
        iconTitle: this.metamodel.iconTitle
      });
    }
    this.formReady.emit(this.aiForm);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!this.preventrecursion && (this.metamodel !== undefined)) {
      if (changes['metamodel'] && !changes['metamodel'].firstChange) {
        this.preventrecursion = true;
        this.aiForm.patchValue({
          iconType: this.metamodel.iconType,
          iconValue: this.metamodel.iconValue,
          iconTitle: this.metamodel.iconTitle
        });
        this.preventrecursion = false;
      }
    }
  }
  get icontype(): IconTypeEnum {
    const ctrt = this.aiForm.get('iconType') as FormControl;
    return ctrt.value;
  }
  get iconvalue(): string {
    const ctrt = this.aiForm.get('iconValue') as FormControl;
    return ctrt.value;
  }
  get showtitle(): boolean {
    switch (this.icontype) {
      case 1:
      case 4:
      case 5:
      case 6:
        return true;
      default:
        return false;
    }
  }
  get icontitle(): number {
    const ctrt = this.aiForm.get('iconTitle') as FormControl;
    return ctrt.value;
  }
  get urlfetch(): string {
    const ctrv = this.aiForm.get('iconValue') as FormControl;
    const iv = ctrv.value;
    switch (this.icontype) {
      case 1:
      case 4:
        return iv;
      case 2:
        return 'fas fa-' + iv;
      case 3:
        return '/images/iconography/' + iv + '.svg';
      case 5:
        return '/FOTO/' + iv + '.jpg';
      case 6:
        return '/FOTO/' + iv + '.svg';
      default:
        return '';
    }
  }

}
