import { Directive, EventEmitter, Injectable, Output, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TimeDelayDirective } from '../services/timedelay.directive';
import { LanguageService } from '../services/language.service';
import { AISuiteMetaModel } from '../models/aisuite.meta.model';
/*
//    ---------------------------------------------------------
//    ---     AISuite Project Ged Zone directive         ---
//    ---------------------------------------------------------
//
// 
*/

@Directive()
@Injectable({
  providedIn: 'root'
})
export class AisuiteDokogedService {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);


  @Output() closed = new EventEmitter();
  @Output() evdokoOK: EventEmitter<string> = new EventEmitter<string>();

  public opened: TimeDelayDirective<boolean> = new TimeDelayDirective<boolean>();

  private urltriggerXML = '';

  public open(show: boolean, url: string) {
    this.urltriggerXML = url;
    this.opened.tima(show);
  }

  public close() {
    this.closed.emit();
  }

  public arrived(id: string) {
    this.triggerXML(id);
  }

  private triggerXML(id: string): void {
    this.http.post<{ body: string } | null>(this.langService.operationBaseUrl + this.urltriggerXML, new AISuiteMetaModel(id))
      .subscribe({
        next: (result: { body: string } | null) => {
          if (result !== null) {
            this.evdokoOK.emit(result.body);
          }
        }, error: (error: HttpErrorResponse) => console.error(`error writing XML : ${error.message}`)
      });
  }

}
