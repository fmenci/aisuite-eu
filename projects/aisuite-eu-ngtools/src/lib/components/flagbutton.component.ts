import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { ALLLIN, DEFAULT_FLAG, LanguageService } from '../services/language.service';
@Component({
    selector: 'ais-flag-button',
    template: `
      @if (check) {
        <button type="button" role="button" class="btn btn-sm"
          (click)="command()"
          [class.btn-primary]="isActive"
          [class.btn-active]="isActive"
          [class.btn-light]="!isActive"
          [attr.title]="label">
          <img [src]="imageUrl" [alt]="altName" />
        </button>
      }
      `,
    styles: [`
      `
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class FlagButtonComponent implements OnInit {
    private service = inject(LanguageService);


    @Input() mylin = ALLLIN;
    @Input() isActive = false;
    @Output() linguaEvent = new EventEmitter<string>();
    altName = DEFAULT_FLAG.altName;
    imageUrl = DEFAULT_FLAG.imageUrl;
    label = DEFAULT_FLAG.label;
    check = DEFAULT_FLAG.check;

    ngOnInit(): void {
      const flag = this.service.getFlag(this.mylin);
        this.altName = flag.altName;
        this.imageUrl = flag.imageUrl;
        this.label = flag.label;
        this.check = flag.check;
      }

    command() {
      this.linguaEvent.emit(this.mylin);
    }

}  