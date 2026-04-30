import { Component, inject } from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { motorData } from '../motor-data.model';

interface InventoryReviewDialogData {
    openPreviousStep: () => void;
    getInventory: () => motorData[];
    clearInventory: () => void;
    deleteInventoryItem: (id: string | undefined) => void;
    saveItemToInventory: (item: motorData) => void;
    toggleField: (fieldName: string) => void;
    toggleAllFields: () => void;
    isFieldSelected: (fieldName: string) => boolean;
    areAllFieldsSelected: () => boolean;
}

@Component({
    selector: 'app-inventory-review-dialog',
    templateUrl: './inventory-review-dialog.html',
    styleUrls: ['./inventory-review-dialog.css'],
    standalone: true,
    imports: [
        FormsModule,
        TextFieldModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule
    ]
})
export class InventoryReviewDialogComponent {
    private dialogRef = inject(MatDialogRef<InventoryReviewDialogComponent>);
    data = inject<InventoryReviewDialogData>(MAT_DIALOG_DATA);
    pageOver = 1;
    currentPage = 0;

    get inventory(): motorData[] {
        return this.data.getInventory();
    }

    get visibleInventory(): motorData[] {
        return this.inventory.slice(this.currentPage, this.pageOver);
    }

    switchPage(e: PageEvent): void {
        this.currentPage = e.pageIndex * e.pageSize;
        this.pageOver = this.currentPage + e.pageSize;
    }

    clearInventory(): void {
        this.data.clearInventory();
        this.currentPage = 0;
        this.pageOver = 1;
    }

    deleteInventoryItem(id: string | undefined): void {
        this.data.deleteInventoryItem(id);
        if (this.currentPage >= this.inventory.length && this.currentPage > 0) {
            this.currentPage = Math.max(0, this.currentPage - 1);
            this.pageOver = this.currentPage + 1;
        }
    }

    saveItemToInventory(item: motorData): void {
        this.data.saveItemToInventory(item);
        if (this.currentPage >= this.inventory.length && this.currentPage > 0) {
            this.currentPage = Math.max(0, this.currentPage - 1);
            this.pageOver = this.currentPage + 1;
        }
    }

    toggleField(fieldName: string): void {
        this.data.toggleField(fieldName);
    }

    toggleAllFields(): void {
        this.data.toggleAllFields();
    }

    isFieldSelected(fieldName: string): boolean {
        return this.data.isFieldSelected(fieldName);
    }

    areAllFieldsSelected(): boolean {
        return this.data.areAllFieldsSelected();
    }

    back(): void {
        this.dialogRef.close();
        this.data.openPreviousStep();
    }

    close(): void {
        this.dialogRef.close();
    }
}
