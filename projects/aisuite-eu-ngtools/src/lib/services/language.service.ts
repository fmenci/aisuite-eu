import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DEFAULT_DOC_HEADER } from './default-doc-header';
import { DEFAULT_LINSCE_ROUTES, LinSceConfig, LinSceConfigService, LinSceExportFormula, LinSceRoutes } from '../api-config';
import { IAjaxResponse } from '../models/iajax.response';
import { IAjaxSingleResponse } from '../models/iajaxsingle.response';
import { ILinguaFlag } from '../models/ilingua.flag';
import { LanguageFormula } from '../models/languageformula.model';
import { LanguageTag } from '../models/languagetag.model';
import { LinguaQueryModel } from '../models/linguaquery.model';
import { TimeDelayDirective } from './timedelay.directive';

export const DEFLIN = 'en'; // aisuite language fallback
export const ALLLIN = '00'; // aisuite any language default value
export const DEFAULT_FLAG: ILinguaFlag = {
  name: ALLLIN,
  altName: 'All languages',
  imageUrl: 'assets/flags/Flag_00.svg',
  label: 'All',
  check: false
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private http = inject(HttpClient);


  public linguas: ILinguaFlag[] = [];
  public docHeaderTemplate = DEFAULT_DOC_HEADER;

  private linformula: LanguageFormula[] = [];
  private tagStatus: LinguaQueryModel[] = [];
  private delaychecktags: TimeDelayDirective = new TimeDelayDirective(3000);

  /** Server routes in use, the defaults completed by the ones of the configuration */
  public readonly routes: LinSceRoutes;
  private config: LinSceConfig;

  constructor() {
    const config = inject<LinSceConfig>(LinSceConfigService);

    // work on a copy: the consumer's config object is never modified
    this.routes = { ...DEFAULT_LINSCE_ROUTES, ...config.routes };
    this.docHeaderTemplate = config.docHeaderTemplate ?? DEFAULT_DOC_HEADER;
    this.config = { ...config, opLingua: config.opLingua?.length >= 2 ? config.opLingua : DEFLIN };
    this.delaychecktags.event.subscribe(() => {
      if (this.tagStatus.length > 0) {
        this.http.post(this.config.linsceApiUrl + this.routes.tagCall, this.tagStatus).subscribe();
        this.tagStatus = [];
      }
    });
    this.initFormula();
    this.initFlags();
    this.initDocHeaderTemplate();
  }

  public label(formula: string, tag: string): string {
    const myformula = this.linformula.find((tm: LanguageFormula) => tm.formula === formula);
    if (myformula !== undefined) {
      const ltag = myformula.tags.find((tm: LanguageTag) => tm.tag === tag);
      if (ltag === undefined) {
        // then add to cache
        myformula.tags.push(new LanguageTag(tag, '*' + tag, 1));
      } else {
        if (ltag.use === undefined) {
          ltag.use = 0;
        }
        if (ltag.use === 0) {
          this.tagStatus.push(new LinguaQueryModel(formula, tag, this.config.opLingua));
          this.delaychecktags.tima();
        }
        ltag.use++;
        return ltag.pcmt;
      }
    }
    // if this is reached, it is a missing tag case
    const foundtag = this.tagStatus.find((tm: LinguaQueryModel) => tm.formula === formula && tm.tag === tag);
    if (foundtag === undefined) {
      this.tagStatus.push(new LinguaQueryModel(formula, tag, this.config.opLingua, true));
      this.delaychecktags.tima();
    }
    // add missing formula to cache
    this.linformula.push(new LanguageFormula(formula, this.config.opLingua, [new LanguageTag(tag, '*' + tag, 1)]));
    return '*' + tag;
  }

  /**
   * Changes the operation language: the labels of the previous language are dropped, the ones given
   * (the export of the server for the new language) are used from now on.
   * The linsceLocalisation pipe takes the language as optional 3rd argument, to be re-evaluated on change.
   */
  public switchLingua(lingua: string, uiLanguageJS: string | LinSceExportFormula[]): void {
    this.config = { ...this.config, opLingua: lingua.length >= 2 ? lingua : DEFLIN, uiLanguageJS };
    this.linformula = [];
    this.tagStatus = [];
    this.initFormula();
    this.initDocHeaderTemplate();
  }

  public getFlag(lin: string): ILinguaFlag {
    return this.linguas.find(l => l.name === lin) ?? DEFAULT_FLAG;
  }

  public getFormula(formula: string, lingua: string): LanguageFormula {
    return this.linformula.find(f => f.formula == formula && f.lingua == lingua)
      ?? new LanguageFormula(formula, lingua, []);
  }

  public get operationLingua(): string {
    return this.config.opLingua;
  }

  public get operationBaseUrl(): string {
    return this.config.linsceApiUrl ?? '';
  }

  public get lintrim00(): ILinguaFlag[] {
    return this.linguas.filter((obj: ILinguaFlag) => { return obj.name !== ALLLIN; })
  };

  private initFormula(): void {
    if (this.config.uiLanguageJS !== undefined) {
      let uiv: LinSceExportFormula[];
      if (typeof this.config.uiLanguageJS === 'string') {
        uiv = JSON.parse(this.config.uiLanguageJS);
      } else {
        uiv = this.config.uiLanguageJS;
      }
      let formcount = uiv.length;
      while (formcount > 0) {
        formcount--;
        const exportformula = uiv[formcount];
        const lformula = new LanguageFormula(exportformula.formula, exportformula.lingua, []);
        const exporttags = exportformula.tags;
        let tagcount = exporttags.length;
        while (tagcount > 0) {
          tagcount--;
          const exporttag = exporttags[tagcount];
          const ntag = new LanguageTag(exporttag.tag, exporttag.pcmt);
          lformula.tags.push(ntag);
        }
        this.linformula.push(lformula);
      }
    }
  }

  private initFlags(): void {
    this.linguas = [];
    this.http.get<IAjaxResponse<ILinguaFlag>>(this.config.linsceApiUrl + this.routes.linguas)
      .subscribe({
        next: (result: IAjaxResponse<ILinguaFlag>) => {
          if (result.success && result.valid) {
            this.linguas = result.data.map<ILinguaFlag>((tm: ILinguaFlag) => {
              return tm;
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(`error init flag query : ${error.message}`);
          this.addDummyFlags();
        }
      });
  }

  private addDummyFlags(): void {
    const fr = {
      "check": true,
      "name": "fr",
      "label": "Drapeau Français, traduction en français",
      "altName": "Français (dummy)",
      "imageUrl": "assets/flags/Flag_of_France.svg"
    };
    this.linguas.push(fr);
    const en = {
      "check": true,
      "name": "en",
      "label": "Union Jack Flag, translation in plain english",
      "altName": "English (dummy)",
      "imageUrl": "assets/flags/Flag_of_the_United_Kingdom.svg"
    };
    this.linguas.push(en);
  }

  private initDocHeaderTemplate() {
    this.http.get<IAjaxSingleResponse<string>>(this.config.linsceApiUrl + this.routes.customerTemplate + '/' +this.config.opLingua)
      .subscribe({
        next: (result: IAjaxSingleResponse<string>) => {
          if (result.success && result.valid) {
            this.docHeaderTemplate = result.data;
          }
        },
        error: () => { /* the default header template is kept */ }
      });
  }

}
