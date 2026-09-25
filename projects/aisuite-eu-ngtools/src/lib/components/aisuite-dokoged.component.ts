import { NgClass, NgStyle } from '@angular/common';
import { Component, HostListener, ViewChild, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FileLoaderModel } from '../models/fileloader.model';
import { DokoAPIDirective } from '../services/doko.api.directive';
import { LanguageService } from '../services/language.service';
import { LinScePipe } from '../services/linsce.pipe';
import { ModalHostDirective } from '../services/modalhost.directive';
import { AisuiteDokogedService } from './aisuite-dokoged.service';

/*
//    ---------------------------------------------------------
//    ---     AISuite Project Doko GED zone component         ---
//    ---------------------------------------------------------
//
*/

@Component({
    selector: 'ais-aisuite-dokoged',
    templateUrl: './aisuite-dokoged.component.html',
    styleUrls: ['./aisuite-dokoged.component.less'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, NgStyle, LinScePipe]
})
export class AisuiteDokogedComponent implements OnInit {
  private gedzoneservice = inject(AisuiteDokogedService);
  private dokoapi = inject(DokoAPIDirective);
  private languagerepo = inject(LanguageService);

  @ViewChild(ModalHostDirective) modalHost!: ModalHostDirective;

  public visible = false;
  public visibleAnimate = false;
  public message = '';
  public percentloaded = 0;
  public arrFiles: File[] = [];

  private preventRebound = false;
  private gdheight = 700;
  private empiricalOffset = 122;
  private cursorpos = 0;
  private cutoff = 0;
  private chunkSize = 10 * 1024;
  private processingFile: File | undefined = undefined;
  private processingTranche = 0;
  private processingId = '';
  private filereader: FileReader;

  constructor() {
    this.filereader = new FileReader();
    this.gedzoneservice.opened.event.subscribe((show: boolean) => {
      if (show) {
        this.show();
      } else {
        this.hide();
      }
    });
    // File execution without log
    this.filereader.onprogress = (evt: ProgressEvent<FileReader>): void => {
      if (evt.lengthComputable) {
        this.showProgress(evt.loaded);
      }
    };
    this.filereader.onloadend = (): void => {
      // FileReader.DONE == 2
      if ((this.filereader.readyState === FileReader.DONE)
        && (this.filereader.result !== null)) {
        this.loadArrived((this.filereader.result as ArrayBuffer));
      }
    };
    this.dokoapi.evcombine.subscribe((evt: boolean) => {
      this.nextDoko(evt);
    });
    this.dokoapi.evtranche.subscribe((id: string | undefined) => {
      if (id === undefined) {
        this.nextDoko(false);
      } else {
        this.processingId = id;
        this.nextTranche();
      }
    });
   }

  ngOnInit(): void {
    this.computeH();
  }

  @HostListener('window:resize')
  onResize() {
    this.computeH();
  }

  public show(): void {
    this.preventRebound = true;
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
    setTimeout(() => this.preventRebound = false, 750);
    this.computeH();
  }

  public hide(): void {
    if (!this.preventRebound) {
      this.visibleAnimate = false;
      setTimeout(() => {
        this.visible = false;
      }, 300);
    }
  }

  get computedheight(): string {
    return this.gdheight + 'px';
  }

  fileSelectHandler(evt: Event): void {
    const element = evt.currentTarget as HTMLInputElement;
    const fileL = element.files;
    if (fileL !== null) {
      let ic = fileL.length;
      while (ic > 0) {
        --ic;
        this.arrFiles.push(fileL[ic]);
      }
    }
    this.next();
  }

  handleDragOver(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    // Explicitly show this is a copy.
    if (evt.dataTransfer !== null) {
      evt.dataTransfer.dropEffect = this.languagerepo.label('WDR', 'GedDropEffect') as DataTransfer['dropEffect'];
    }
  }

  fileDropHandler(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    if (evt.dataTransfer !== null) {
      const fileL = evt.dataTransfer.files;
      // FileList object
      if (fileL !== undefined) {
        let ic = fileL.length;
        while (ic > 0) {
          --ic;
          this.arrFiles.push(fileL[ic]);
        }
      }
    }
    this.next();
  }

  next(): void {
    const pending = this.processingFile === undefined ? this.arrFiles.pop() : undefined;
    if (pending !== undefined) {
      this.read(pending);
    } else {
      this.message = this.languagerepo.label('WDR', 'GedNoFileMessage');
    }
  }

  read(file: File): void {
    this.message = '';
    this.percentloaded = 0;
    this.processingFile = file;
    this.processingTranche = 1;
    this.processingId = '';
    this.cursorpos = 0;
    this.cutoff = 0;
    this.pushcutoff();
    const blob = file.slice(this.cursorpos, this.cutoff + 1);
    this.filereader.readAsArrayBuffer(blob);
  }

  /** the file being processed, only read while a file is processing */
  private get file(): File {
    return this.processingFile as File;
  }

  get readActive(): boolean {
    return (this.arrFiles.length > 0) || (this.processingFile !== undefined);
  }

  private computeH() {
    this.gdheight = window.innerHeight - this.empiricalOffset;
  }

  private pushcutoff(): void {
    this.cutoff += this.chunkSize;
    if (this.cutoff > this.file.size) {
      this.cutoff = this.file.size;
    }
  }

  private showProgress(evtLoaded: number): void {
    const end = this.file.size;
    const pos = this.cursorpos + evtLoaded;
    this.percentloaded = Math.round(pos / end * 100);
  }

  private loadArrived(result: ArrayBuffer): void {
    const buffer = new Uint8Array(result);
    const arrStream = [];
    let i = 0;
    while (i < buffer.length) {
      arrStream.push(buffer[i]);
      i++;
    }
    this.dokoapi.feedTranche(
      new FileLoaderModel(
        this.processingId,
        this.processingTranche,
        btoa(String.fromCharCode.apply(null, arrStream)),
        this.file.name,
        this.file.type
      )
    );
  }

  private nextTranche(): void {
    if (this.cutoff < this.file.size) {
      this.processingTranche++;
      this.cursorpos = this.cutoff + 1;
      this.pushcutoff();
      this.message = this.processingTranche + ' | ' + this.cursorpos + ' -> ' + this.cutoff;
      const blob = this.file.slice(this.cursorpos, this.cutoff + 1);
      this.filereader.readAsArrayBuffer(blob);
    } else {
      this.dokoapi.combine(this.processingId);
    }
  }

  private nextDoko(evt: boolean) {
    this.percentloaded = 100;
    const tag = evt === true ? 'GedFileLoadedMessage' : 'GedFileFailedMessage';
    this.message = this.languagerepo.label('WDR', tag) + ' ' + this.file.name;
    // set time out
    setTimeout(() => {
      this.gedzoneservice.arrived(this.processingId);
      this.processingFile = undefined;
      this.next();
    }, 1200);
  }


}
