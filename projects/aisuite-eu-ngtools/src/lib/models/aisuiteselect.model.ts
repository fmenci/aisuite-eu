import { AISuiteCoreListItemModel } from './aisuitecore.listitem.model';

/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

export class AisuiteSelectModel {
  constructor(
    public name: string,
    public unicId: string,
    public ondate: Date,
    public listdata?: AISuiteCoreListItemModel[]
  ) {}
}
