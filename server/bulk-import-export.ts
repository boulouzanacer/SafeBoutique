import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import { Product, insertProductSchema } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';
import { storage } from './storage';
import * as XLSX from 'xlsx';

export interface BulkImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    product: any;
    error: string;
  }>;
  message: string;
}

export interface BulkExportResult {
  success: boolean;
  filename: string;
  count: number;
  message: string;
}

// Mapping from your Excel/CSV column names to our database schema
const COLUMN_MAPPING: { [key: string]: string } = {
  'Code barre': 'codeBarre',
  'Réf produit': 'refProduit', 
  'Désignation': 'produit',
  'PA TTC': 'paHt',
  'PAMP TTC': 'pampHt',
  'Stock ( Unité )': 'stock',
  'prix vente TTC': 'pv1Ht',
  'Prix sup TTC': 'pv2Ht',
  'Prix gros TTC': 'pv3Ht',
  'DDDD TTC': 'pv4Ht',
  'Prix Promo TTC': 'pp1Ht',
  'Famille': 'famille'
};

// Your format CSV headers for export
const EXPORT_CSV_HEADERS = [
  { id: 'codeBarre', title: 'Code barre' },
  { id: 'refProduit', title: 'Réf produit' },
  { id: 'produit', title: 'Désignation' },
  { id: 'paHt', title: 'PA TTC' },
  { id: 'pampHt', title: 'PAMP TTC' },
  { id: 'stock', title: 'Stock ( Unité )' },
  { id: 'pv1Ht', title: 'prix vente TTC' },
  { id: 'pv2Ht', title: 'Prix sup TTC' },
  { id: 'pv3Ht', title: 'Prix gros TTC' },
  { id: 'pv4Ht', title: 'DDDD TTC' },
  { id: 'pp1Ht', title: 'Prix Promo TTC' },
  { id: 'famille', title: 'Famille' }
];

const REQUIRED_COLUMNS = ['Désignation', 'Réf produit'];

class BulkImportExportService {
  private uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Export products to CSV format using your Excel format
   */
  async exportProductsToCSV(): Promise<BulkExportResult> {
    try {
      const products = await storage.getProducts({});
      const filename = `products-export-${Date.now()}.csv`;
      const filepath = path.join(this.uploadsDir, filename);

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: EXPORT_CSV_HEADERS
      });

      // Transform database format to your CSV format
      const transformedProducts = products.map(product => ({
        codeBarre: product.codeBarre || '',
        refProduit: product.refProduit || '',
        produit: product.produit || '',
        paHt: product.paHt || 0,
        pampHt: product.pampHt || 0,
        stock: product.stock || 0,
        pv1Ht: product.pv1Ht || 0,
        pv2Ht: product.pv2Ht || 0,
        pv3Ht: product.pv3Ht || 0,
        pv4Ht: product.pv4Ht || 0,
        pp1Ht: product.pp1Ht || 0,
        famille: product.famille || ''
      }));

      await csvWriter.writeRecords(transformedProducts);

      return {
        success: true,
        filename,
        count: products.length,
        message: `Successfully exported ${products.length} products to CSV`
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        filename: '',
        count: 0,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import products from CSV or Excel buffer using your format
   */
  async importProductsFromCSV(buffer: Buffer): Promise<BulkImportResult> {
    try {
      let data: any[] = [];
      
      // Try to detect file format and parse accordingly
      const bufferStart = buffer.slice(0, 4);
      const isExcel = this.isExcelFile(bufferStart);
      
      if (isExcel) {
        // Parse Excel file
        data = this.parseExcelBuffer(buffer);
      } else {
        // Parse CSV file
        data = await this.parseCSVBuffer(buffer);
      }

      if (data.length === 0) {
        return {
          success: false,
          imported: 0,
          errors: [],
          message: 'No data found in file'
        };
      }

      // Validate required columns
      const firstRow = data[0];
      const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        return {
          success: false,
          imported: 0,
          errors: [],
          message: `Missing required columns: ${missingColumns.join(', ')}`
        };
      }

      const results = {
        success: true,
        imported: 0,
        errors: [] as Array<{ row: number; product: any; error: string }>,
        message: ''
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        
        try {
          // Transform from your format to database format
          const transformedProduct = this.transformImportedProduct(rowData);
          
          // Validate the product data
          const validatedProduct = insertProductSchema.parse(transformedProduct);
          
          // Check if product exists (by refProduit or codeBarre)
          const existingProduct = await this.findExistingProduct(
            transformedProduct.refProduit, 
            transformedProduct.codeBarre
          );

          if (existingProduct) {
            // Update existing product
            await storage.updateProduct(existingProduct.recordid!, validatedProduct);
          } else {
            // Create new product
            await storage.createProduct(validatedProduct);
          }

          results.imported++;
        } catch (error) {
          results.errors.push({
            row: i + 1,
            product: rowData,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      results.success = results.errors.length < data.length;
      results.message = `Processed ${data.length} rows. Imported: ${results.imported}, Errors: ${results.errors.length}`;

      return results;
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [],
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate CSV template with your format
   */
  async generateCSVTemplate(): Promise<BulkExportResult> {
    try {
      const filename = `template-${Date.now()}.csv`;
      const filepath = path.join(this.uploadsDir, filename);

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: EXPORT_CSV_HEADERS
      });

      // Create sample data with your format
      const sampleData = [
        {
          codeBarre: 'EXAMPLE001',
          refProduit: 'REF001',
          produit: 'Exemple produit 1',
          paHt: 50,
          pampHt: 60,
          stock: 10,
          pv1Ht: 80,
          pv2Ht: 75,
          pv3Ht: 65,
          pv4Ht: 0,
          pp1Ht: 70,
          famille: 'Exemple famille'
        },
        {
          codeBarre: 'EXAMPLE002',
          refProduit: 'REF002', 
          produit: 'Exemple produit 2',
          paHt: 30,
          pampHt: 35,
          stock: 5,
          pv1Ht: 50,
          pv2Ht: 45,
          pv3Ht: 40,
          pv4Ht: 0,
          pp1Ht: 0,
          famille: 'Exemple famille'
        }
      ];

      await csvWriter.writeRecords(sampleData);

      return {
        success: true,
        filename,
        count: sampleData.length,
        message: 'Template generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        count: 0,
        message: `Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get file path for download
   */
  async getExportFilePath(filename: string): Promise<string | null> {
    try {
      const filepath = path.join(this.uploadsDir, filename);
      await fs.access(filepath);
      return filepath;
    } catch {
      return null;
    }
  }

  // Helper methods
  private isExcelFile(buffer: Buffer): boolean {
    // Excel file signatures
    const excelSignatures = [
      [0xD0, 0xCF, 0x11, 0xE0], // XLS
      [0x50, 0x4B, 0x03, 0x04], // XLSX (ZIP format)
      [0x50, 0x4B, 0x05, 0x06], // XLSX (ZIP format)
      [0x50, 0x4B, 0x07, 0x08]  // XLSX (ZIP format)
    ];

    return excelSignatures.some(signature => 
      signature.every((byte, index) => buffer[index] === byte)
    );
  }

  private parseExcelBuffer(buffer: Buffer): any[] {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      throw new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseCSVBuffer(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private transformImportedProduct(rowData: any): any {
    const transformed: any = {
      // Set defaults for required fields based on actual schema
      recordid: undefined, // Will be auto-generated
      codeBarre: '',
      cbColis: '',
      refProduit: '',
      produit: '',
      paHt: 0,
      tva: 20, // Default 20% VAT
      pampHt: 0,
      pv1Ht: 0,
      pv2Ht: 0,
      pv3Ht: 0,
      pv4Ht: 0,
      pv5Ht: 0,
      pv6Ht: 0,
      pvLimite: 0,
      ppa: 0,
      stock: 0,
      colissage: 0,
      stockIni: 0,
      prixIni: 0,
      blocage: 0,
      gerPoids: 0,
      sup: 0,
      famille: '',
      sousFamille: '',
      photo: '',
      detaille: '',
      codeFrs: '',
      promo: 0,
      d1: null,
      d2: null,
      pp1Ht: 0,
      qtePromo: 0,
      fid: 0,
      marque: '',
      um: 'Pièce',
      poids: 0,
      utilisateur: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Map your columns to database fields
    Object.entries(COLUMN_MAPPING).forEach(([yourColumn, dbField]) => {
      if (rowData[yourColumn] !== undefined && rowData[yourColumn] !== null && rowData[yourColumn] !== '') {
        let value = rowData[yourColumn];
        
        // Convert numeric fields
        if (['paHt', 'pampHt', 'stock', 'pv1Ht', 'pv2Ht', 'pv3Ht', 'pv4Ht', 'pp1Ht', 'tva'].includes(dbField)) {
          value = parseFloat(value) || 0;
        }
        
        transformed[dbField] = value;
      }
    });

    // Set promo flag if promo price exists
    if (transformed.pp1Ht > 0) {
      transformed.promo = 1;
    }

    return transformed;
  }

  private async findExistingProduct(refProduit?: string, codeBarre?: string): Promise<Product | null> {
    try {
      const products = await storage.getProducts({});
      
      return products.find(p => 
        (refProduit && p.refProduit === refProduit) ||
        (codeBarre && p.codeBarre === codeBarre)
      ) || null;
    } catch {
      return null;
    }
  }
}

export const bulkImportExportService = new BulkImportExportService();