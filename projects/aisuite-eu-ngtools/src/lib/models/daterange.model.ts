
/*
//    ------------------------------------------------------------
//    ---     AISuite Project WDR aisuite-ngtools              ---
//    ------------------------------------------------------------
//
// this is either re-used here or copied everywhere else it is needed thus enabling a single point for development.
*/

export class DateRangeModel {
  constructor(
    public unicId: string,
    public fromDate: Date | null,
    public toDate: Date | null,
    public tipo: number
  ) { }
}
