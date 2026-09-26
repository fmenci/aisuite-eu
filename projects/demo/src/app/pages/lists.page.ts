import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AiControlListComponent, IconDtoModel, IconSelectorControlComponent, IconTypeEnum, SelectorControlComponent } from '@aisuite-eu/ngtools';
import { DemoCard } from '../shared/demo-card';

@Component({
  selector: 'app-lists-page',
  imports: [ReactiveFormsModule, JsonPipe, DemoCard, AiControlListComponent, IconSelectorControlComponent, SelectorControlComponent],
  templateUrl: './lists.page.html'
})
export class ListsPage {
  protected readonly form = new FormGroup({
    country: new FormControl('', { nonNullable: true }),
    department: new FormGroup({
      unicId: new FormControl(''),
      name: new FormControl('')
    }),
    icon: new FormGroup({
      iconType: new FormControl(IconTypeEnum.fontawesome),
      iconValue: new FormControl(''),
      iconTitle: new FormControl('')
    })
  });
  protected readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  protected readonly iconModel = new IconDtoModel(IconTypeEnum.fontawesome, 'rocket', 'Rocket');
}
