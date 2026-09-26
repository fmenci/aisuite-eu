import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Directive, EventEmitter, Injectable, Output, inject } from '@angular/core';
import { catchError, concatMap, map, Observable, of, Subject } from 'rxjs';
import { LanguageService } from './language.service';
import { AISuiteMetaModel } from '../models/aisuite.meta.model';
import { FileLoaderModel } from '../models/fileloader.model';

@Directive()
@Injectable()
/*
//    ---------------------------------------------------------
//    ---     AISuite Project Doko Ged directive        ---
//    ---------------------------------------------------------
//
*/
export class DokoAPIDirective {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);

  /** Guid of the created record once the slice is stored, undefined when the slice failed */
  @Output() evtranche: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
  @Output() evcombine: EventEmitter<boolean> = new EventEmitter<boolean>();

  // calls are queued : one request at a time, in call order, exactly one event per call
  private trancheQueue = new Subject<FileLoaderModel>();
  private combineQueue = new Subject<string>();

  constructor() {
    this.trancheQueue
      .pipe(concatMap((flmodel: FileLoaderModel) => this.postTranche(flmodel)))
      .subscribe((id: string | undefined) => this.evtranche.emit(id));
    this.combineQueue
      .pipe(concatMap((id: string) => this.postCombine(id)))
      .subscribe((done: boolean) => this.evcombine.emit(done));
  }

  public feedTranche(flmodel: FileLoaderModel): void {
    this.trancheQueue.next(flmodel);
  }

  public combine(id: string): void {
    this.combineQueue.next(id);
  }

  private postTranche(flmodel: FileLoaderModel): Observable<string | undefined> {
    return this.http.post<string>(this.langService.operationBaseUrl + this.langService.routes.dokoTranche, flmodel)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`error writing file slice : ${error.message}`);
          return of(undefined);
        })
      );
  }

  private postCombine(id: string): Observable<boolean> {
    // the server answers the Guid of the created record as a plain string
    return this.http.post(this.langService.operationBaseUrl + this.langService.routes.dokoCombine,
      new AISuiteMetaModel(id),
      { responseType: 'string' as 'json', observe: 'response' }
    )
      .pipe(
        map((result: HttpResponse<unknown>) => result.body === id),
        catchError((error: HttpErrorResponse) => {
          console.error(`error writing media : ${error.message}`);
          return of(false);
        })
      );
  }

}
