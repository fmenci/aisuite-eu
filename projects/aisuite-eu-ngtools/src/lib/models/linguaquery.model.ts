
/*
//    ---------------------------------------------------------
//    ---     AISuite typescript tools         ---
//    ---     Query model passing in post request    ---
//    ---------------------------------------------------------
//
*/

export class LinguaQueryModel {
  constructor(
    public formula: string,
    public tag: string,
    public lingua: string,
    public search = false
  ) { }
}
