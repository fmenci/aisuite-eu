
/*
//    ---------------------------------------------------------
//    ---     AISuite Project Doko GED         ---
//    ---------------------------------------------------------
//
// doko file descriptor
*/

export class DownloadFileModel {
  constructor(
    public filename: string,
    public data: Blob | null
  ) { }
}
