import { TestBed } from '@angular/core/testing';

import { NgxFireFirestoreService } from './ngx-fire-firestore.service';

describe('NgxFireFirestoreService', () => {
  let service: NgxFireFirestoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFireFirestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
