import { Component, signal } from '@angular/core';
import { DokoPage } from './pages/doko.page';
import { HelpersPage } from './pages/helpers.page';
import { InputsPage } from './pages/inputs.page';
import { LinguaPage } from './pages/lingua.page';
import { LinscePage } from './pages/linsce.page';
import { ListsPage } from './pages/lists.page';

interface DemoTab { id: string; title: string; icon: string; }

/** One tab per family of components */
const TABS: DemoTab[] = [
  { id: 'inputs', title: 'Value inputs', icon: 'fa-keyboard' },
  { id: 'lists', title: 'Lists and icons', icon: 'fa-list' },
  { id: 'lingua', title: 'Languages', icon: 'fa-flag' },
  { id: 'linsce', title: 'LinSce labels', icon: 'fa-tags' },
  { id: 'doko', title: 'Document upload', icon: 'fa-file-arrow-up' },
  { id: 'helpers', title: 'Validators and helpers', icon: 'fa-check-double' }
];

@Component({
  selector: 'app-root',
  // the pages are only used inside @defer blocks, so each one is a lazy chunk loaded when its tab is first opened
  imports: [DokoPage, HelpersPage, InputsPage, LinguaPage, LinscePage, ListsPage],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly tabs = TABS;
  protected readonly active = signal(TABS[0].id);
  /** Tabs already visited: their panel stays mounted, so the state of a page is kept when leaving it */
  protected readonly opened = signal([TABS[0].id]);

  protected select(id: string): void {
    this.active.set(id);
    if (!this.opened().includes(id)) {
      this.opened.update(list => [...list, id]);
    }
  }

  /** Keyboard pattern of the ARIA tabs: arrows and Home / End move to the tab and open it */
  protected onKey(event: KeyboardEvent): void {
    const last = this.tabs.length - 1;
    const current = this.tabs.findIndex(tab => tab.id === this.active());
    const target = { ArrowRight: current === last ? 0 : current + 1, ArrowLeft: current === 0 ? last : current - 1, Home: 0, End: last }[event.key];
    if (target !== undefined) {
      event.preventDefault();
      this.select(this.tabs[target].id);
      document.getElementById('tab-' + this.tabs[target].id)?.focus();
    }
  }
}
