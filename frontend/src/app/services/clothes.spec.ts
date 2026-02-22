import { TestBed } from '@angular/core/testing';

import { Clothes } from './clothes';

describe('Clothes', () => {
  let service: Clothes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clothes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
