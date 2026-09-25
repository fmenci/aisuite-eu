
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

export class AISuiteCoreListItemModel {
  constructor(
    public id?: string,
    public name?: string,
    public description?: string,
    public cssClass?: string,
    public isPresel?: boolean,
    public html?: string
  ) { }
}
