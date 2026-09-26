import { AISuiteCoreListItemModel, ILinguaFlag, LinSceExportFormula } from '@aisuite-eu/ngtools';

const flag = (name: string, altName: string, file: string): ILinguaFlag => ({
  name, altName, label: altName, check: true, imageUrl: `assets/flags/${file}.svg`
});

export const DEMO_FLAGS: ILinguaFlag[] = [
  { name: '00', altName: 'All languages', label: 'All', check: false, imageUrl: 'assets/flags/Flag_00.svg' },
  flag('en', 'English', 'Flag_of_the_United_Kingdom'),
  flag('fr', 'Français', 'Flag_of_France'),
  flag('de', 'Deutsch', 'Flag_of_Germany'),
  flag('it', 'Italiano', 'Flag_of_Italy'),
  flag('es', 'Español', 'Flag_of_Spain')
];

/** Labels of the WDR formula by language, the tags the server does not know are shown as *tag */
const DEMO_TAGS: Record<string, Record<string, string>> = {
  en: {
    GedModalTitle: 'Document upload', GedFileToolLabel: 'Select files', GedDropLabel: 'or drop files here',
    GedQueueLabel: 'Files in the queue', LastModifiedLabel: 'last modified', GedDropEffect: 'copy',
    GedNoFileMessage: 'No file to process', GedFileLoadedMessage: 'Loaded:', GedFileFailedMessage: 'Failed:',
    Greeting: 'Hello from the LinSce label database', Farewell: 'See you soon'
  },
  fr: {
    GedModalTitle: 'Dépôt de documents', GedFileToolLabel: 'Choisir des fichiers', GedDropLabel: 'ou déposez les fichiers ici',
    GedQueueLabel: 'Fichiers en attente', LastModifiedLabel: 'modifié le', GedDropEffect: 'copy',
    GedNoFileMessage: 'Aucun fichier à traiter', GedFileLoadedMessage: 'Chargé :', GedFileFailedMessage: 'Échec :',
    Greeting: 'Bonjour depuis la base de libellés LinSce', Farewell: 'À bientôt'
  },
  de: {
    GedModalTitle: 'Dokumente hochladen', Greeting: 'Hallo aus der LinSce-Beschriftungsdatenbank', Farewell: 'Bis bald'
  },
  it: {
    GedModalTitle: 'Caricamento documenti', Greeting: 'Ciao dal database di etichette LinSce', Farewell: 'A presto'
  },
  es: {
    GedModalTitle: 'Carga de documentos', Greeting: 'Hola desde la base de etiquetas LinSce', Farewell: 'Hasta pronto'
  }
};

/** Export of the server (uiLanguageJS) for one language */
export const demoLabels = (lingua: string): LinSceExportFormula[] => [{
  formula: 'WDR', lingua,
  tags: Object.entries(DEMO_TAGS[lingua] ?? {}).map(([tag, pcmt]) => ({ tag, pcmt }))
}];

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
