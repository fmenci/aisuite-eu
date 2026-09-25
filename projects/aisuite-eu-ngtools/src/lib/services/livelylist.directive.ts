import { EventEmitter, Injectable, Output, Directive } from '@angular/core';
import { AisuiteSelectModel } from '../models/aisuiteselect.model';

@Directive()
@Injectable({
  providedIn: 'root',
})
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/
export class LivelyListDirective {
  @Output() evRefresh: EventEmitter<AisuiteSelectModel> = new EventEmitter<AisuiteSelectModel>();
  @Output() evPull: EventEmitter<AisuiteSelectModel> = new EventEmitter<AisuiteSelectModel>();

  private mycache: AisuiteSelectModel[];
  constructor() {
    this.mycache = [];
  }

  public addcache(objcore: AisuiteSelectModel) {
    const obj = this.retrivecache(objcore);
    this.evRefresh.emit(obj);
  }

  public pulllist(req: AisuiteSelectModel) {
    const obj = this.retrivecache(req);
    if ((obj.listdata !== undefined) && (obj.listdata.length > 0)) {
      this.evRefresh.emit(obj);
    } else {
      this.evPull.emit(req);
    }
  }

  public clear(): void {
    this.mycache = [];
  }

  private retrivecache(objcore: AisuiteSelectModel): AisuiteSelectModel {
    const findObj = this.mycache.find((tm: AisuiteSelectModel) =>
      (tm.name === objcore.name)
      && (tm.unicId === objcore.unicId)
      && (tm.listdata !== undefined)
      && (tm.listdata.length > 0)
    );
    if (findObj !== undefined) {
      return findObj;
    }
    if ((objcore.listdata !== undefined) && (objcore.listdata.length > 0)) {
      this.mycache.push(objcore);
    }
    return objcore;
  }
}
