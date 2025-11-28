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
      fetch('http://localhost:5000/api/test-login', {method: 'POST'})
        .then(res => res.json())
    );
  }


  getInventory() {
    const inventory$ = from(
      fetch('http://localhost:5000/api/products').then(res => res.json())
    );
    return toSignal(inventory$, {initialValue: []});
  }

  async createProduct(data: any) {
    return fetch('http://localhost:5000/api/createProduct', {
      method: 'POST',
      body: data,
    })
      .then(res => res.json());
  }

  async getCategories() {
    return fetch("http://localhost:5000/api/categorys")
      .then(res => res.json())
      .then(data => data)
      .catch(err => {
        console.error("Fout bij categories ophalen:", err);
        return [];
      });
  }

  async getGroups() {
    return fetch("http://localhost:5000/api/groups")
      .then(res => res.json())
      .then(data => data)
      .catch(err => {
        console.error("Fout bij groups ophalen:", err);
        return [];
      });

  }

  async createCategory(data: any) {
    return fetch('http://localhost:5000/api/createCategory', {
      method: 'POST',
      body: data,
    })
      .then(res => res.json());
  }

  async createGroup(data: any) {
    return fetch('http://localhost:5000/api/createGroup', {
      method: 'POST',
      body: data,
    })
      .then(res => res.json());
  }


  async archiveProducts(data: any) {
    return fetch('http://localhost:5000/api/archiveProducts', {
      method: 'POST',
      body: data,
    })
      .then(res => res.json());
  }
}





