import { TestBed } from '@angular/core/testing';

import { OpenLibraryExternal } from './open-library-external';

describe('OpenLibraryExternal', () => {
  let service: OpenLibraryExternal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenLibraryExternal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
