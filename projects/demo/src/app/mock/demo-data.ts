import { AISuiteCoreListItemModel, ILinguaFlag, LinSceExportFormula } from '@aisuite-eu/ngtools';

const flag = (name: string, altName: string, file: string): ILinguaFlag => ({
  name, altName, label: altName, check: true, imageUrl: `assets/flags/${file}.svg`
});

export const DEMO_FLAGS: ILinguaFlag[] = [
  { name: '00', altName: 'All languages', label: 'All', check: false, imageUrl: 'assets/flags/Flag_00.svg' },
  flag('en', 'English', 'Flag_of_the_United_Kingdom'),
  flag('fr', 'Français', 'Flag_of_France'),
  flag('de', 'Deutsch', 'Flag_of_Germany'),
  flag('it', 'Italiano', 'Flag_of_Italy')
];

/** Labels of the WDR formula, as the AI Suite server would export them */
export const DEMO_LABELS: LinSceExportFormula[] = [
  {
    formula: 'WDR', lingua: 'en', tags: [
      { tag: 'GedModalTitle', pcmt: 'Document upload' },
      { tag: 'GedFileToolLabel', pcmt: 'Select files' },
      { tag: 'GedDropLabel', pcmt: 'or drop files here' },
      { tag: 'GedQueueLabel', pcmt: 'Files in the queue' },
      { tag: 'LastModifiedLabel', pcmt: 'last modified' },
      { tag: 'GedDropEffect', pcmt: 'copy' },
      { tag: 'GedNoFileMessage', pcmt: 'No file to process' },
      { tag: 'GedFileLoadedMessage', pcmt: 'Loaded:' },
      { tag: 'GedFileFailedMessage', pcmt: 'Failed:' },
      { tag: 'Greeting', pcmt: 'Hello from the LinSce label database' },
      { tag: 'Farewell', pcmt: 'See you soon' }
    ]
  }
];

const item = (id: string, name: string, isPresel = false): AISuiteCoreListItemModel =>
  new AISuiteCoreListItemModel(id, name, name, '', isPresel, name);

export const DEMO_LISTS: Record<string, AISuiteCoreListItemModel[]> = {
  Countries: [
    item('FR', 'France', true), item('DE', 'Germany', true), item('IT', 'Italy'), item('ES', 'Spain'),
    item('PT', 'Portugal'), item('BE', 'Belgium'), item('NL', 'Netherlands'), item('CH', 'Switzerland')
  ],
  Departments: [
    item('75', 'Paris'), item('13', 'Bouches-du-Rhône'), item('69', 'Rhône'), item('33', 'Gironde'),
    item('31', 'Haute-Garonne'), item('59', 'Nord'), item('67', 'Bas-Rhin')
  ]
};
