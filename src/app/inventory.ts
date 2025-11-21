import {inject, Injectable, signal} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {searchForGlobalZoneless} from '@angular/cli/src/commands/mcp/tools/onpush-zoneless-migration/migrate_test_file';
import {from} from 'rxjs';



@Injectable({
  providedIn: 'root',
})

export class Inventory {

  login() {
    return from(
      fetch('http://localhost:5000/api/login', {method: 'POST'})
        .then(res => res.json())
    );
  }



  getInventory() {
    const inventory$ = from(
      fetch('http://localhost:5000/api/products').then(res => res.json())
    );
    return toSignal(inventory$, { initialValue: [] });
  }

}





