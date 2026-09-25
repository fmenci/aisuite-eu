
/*
//    ---------------------------------------------------------
//    ---     AISuite Project Doko GED         ---
//    ---------------------------------------------------------
//
// doko file loader slice model, enables to stay under 1 Mo during download
*/

export class FileLoaderModel {
  constructor(
    public unicId?: string,
    public tranche?: number,
    public data?: string,
    public fileName?: string,
    public mimeType?: string
  ) { }
}
