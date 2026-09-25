import { Component, OnInit, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { LanguageService } from './services/language.service';
import { LanguageFormula } from './models/languageformula.model';

@Component({
    selector: 'ais-linsce-display',
    template: `
    <div>
      <h3>Lingua Scenario Arte Scriba &reg; AI Suite &copy;</h3>
      <div class="formula" [attr.data-id]="linscedsp?.formula">
        <p class="formula" [attr.data-id]="linscedsp?.formula">{{linscedsp?.formula}} (<span [attr.data-id]="linscedsp?.formula" [attr.data-lingua]="linscedsp?.lingua">{{linscedsp?.lingua}}</span>)</p>
        @if (linscedsp?.tags) {
          <div class="tags">
            @for (tag of linscedsp.tags; track tag) {
              <div class="tags">
                <pre class="tags" [attr.data-id]="linscedsp.formula"
                  [attr.data-lingua]="linscedsp.lingua"
                  [attr.data-tag]="tag.tag">
                  {{tag.pcmt}}
                </pre>
              </div>
            }
          </div>
        }
      </div>
    </div>
    `,
    styles: [`
    div.tags {
      margin: 0;
      padding: 0;
    }
    pre.tags{
      display: block;
      font-size: 1.1em;
      margin: 2px;
      padding: 4px 8px;
      background: #def;
      border: #bbb 1px solid;
      list-style: none;
      }
    `
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class AisuiteNgtoolsComponent implements OnInit {
  private service = inject(LanguageService);


  public linscedsp: LanguageFormula | undefined;
  @Input() myformula='WDR';
  @Input() mylin='en';

  ngOnInit(): void {
    this.linscedsp = this.service.getFormula(this.myformula, this.mylin);
  }

}
