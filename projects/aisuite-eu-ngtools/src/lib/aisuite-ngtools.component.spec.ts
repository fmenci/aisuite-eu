import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinSceConfigService } from './api-config';
import { AisuiteNgtoolsComponent } from './aisuite-ngtools.component';
import { beforeEach, describe, expect, it } from 'vitest';

describe('AisuiteNgtoolsComponent', () => {
  let component: AisuiteNgtoolsComponent;
  let fixture: ComponentFixture<AisuiteNgtoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AisuiteNgtoolsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LinSceConfigService, useValue: { opLingua: 'en', linsceApiUrl: '', uiLanguageJS: undefined } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AisuiteNgtoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
