import { Routes } from '@angular/router';
import {InventoryPage} from './inventory-page/inventory-page';
import {EditQuantity} from './edit-quantity/edit-quantity';

export const routes: Routes = [
  {path: 'inventory',component: InventoryPage},
  {path: 'editQTY' , component: EditQuantity}

];
