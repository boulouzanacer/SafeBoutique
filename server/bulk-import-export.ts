import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import { Product, insertProductSchema } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';
import { storage } from './storage';

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
   * Export products to CSV format
   */
  async exportProductsToCSV(): Promise<BulkExportResult> {
    try {
      const products = await storage.getProducts({});
      const filename = `products-export-${Date.now()}.csv`;
      const filepath = path.join(this.uploadsDir, filename);

      // Define CSV headers based on the Product schema
      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: [
          { id: 'recordid', title: 'ID' },
          { id: 'codeBarre', title: 'Barcode' },
          { id: 'cbCaisse', title: 'Case Barcode' },
          { id: 'refProduit', title: 'Product Reference' },
          { id: 'produit', title: 'Product Name' },
          { id: 'detaille', title: 'Description' },
          { id: 'famille', title: 'Family' },
          { id: 'sousFamille', title: 'Subfamily' },
          { id: 'marque', title: 'Brand' },
          { id: 'modele', title: 'Model' },
          { id: 'couleur', title: 'Color' },
          { id: 'taille', title: 'Size' },
          { id: 'poids', title: 'Weight' },
          { id: 'volume', title: 'Volume' },
          { id: 'stock', title: 'Stock' },
          { id: 'stockMin', title: 'Minimum Stock' },
          { id: 'stockMax', title: 'Maximum Stock' },
          { id: 'prixAchat', title: 'Purchase Price' },
          { id: 'pv1Ht', title: 'Selling Price 1 (HT)' },
          { id: 'pv2Ht', title: 'Selling Price 2 (HT)' },
          { id: 'pv3Ht', title: 'Selling Price 3 (HT)' },
          { id: 'pv1Ttc', title: 'Selling Price 1 (TTC)' },
          { id: 'pv2Ttc', title: 'Selling Price 2 (TTC)' },
          { id: 'pv3Ttc', title: 'Selling Price 3 (TTC)' },
          { id: 'taux', title: 'Tax Rate' },
          { id: 'remise', title: 'Discount' },
          { id: 'promo', title: 'Promotion (1=Yes, 0=No)' },
          { id: 'active', title: 'Active (1=Yes, 0=No)' },
          { id: 'photo', title: 'Photo (Base64 or URL)' },
        ]
      });

      await csvWriter.writeRecords(products);

      return {
        success: true,
        filename,
        count: products.length,
        message: `Successfully exported ${products.length} products to ${filename}`
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
   * Import products from CSV data
   */
  async importProductsFromCSV(csvData: Buffer): Promise<BulkImportResult> {
    const results: BulkImportResult = {
      success: true,
      imported: 0,
      errors: [],
      message: ''
    };

    try {
      const products: any[] = [];
      
      // Parse CSV data
      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(csvData.toString());
        
        stream
          .pipe(csv({
            // Map CSV headers to schema fields (case-insensitive)
            mapHeaders: ({ header }) => {
              const headerMap: { [key: string]: string } = {
                'id': 'recordid',
                'barcode': 'codeBarre',
                'case barcode': 'cbCaisse',
                'product reference': 'refProduit',
                'product name': 'produit',
                'description': 'detaille',
                'family': 'famille',
                'subfamily': 'sousFamille',
                'brand': 'marque',
                'model': 'modele',
                'color': 'couleur',
                'size': 'taille',
                'weight': 'poids',
                'volume': 'volume',
                'stock': 'stock',
                'minimum stock': 'stockMin',
                'maximum stock': 'stockMax',
                'purchase price': 'prixAchat',
                'selling price 1 (ht)': 'pv1Ht',
                'selling price 2 (ht)': 'pv2Ht',
                'selling price 3 (ht)': 'pv3Ht',
                'selling price 1 (ttc)': 'pv1Ttc',
                'selling price 2 (ttc)': 'pv2Ttc',
                'selling price 3 (ttc)': 'pv3Ttc',
                'tax rate': 'taux',
                'discount': 'remise',
                'promotion (1=yes, 0=no)': 'promo',
                'active (1=yes, 0=no)': 'active',
                'photo (base64 or url)': 'photo'
              };
              
              const lowerHeader = header.toLowerCase();
              return headerMap[lowerHeader] || header;
            }
          }))
          .on('data', (data) => products.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      // Process each product
      for (let i = 0; i < products.length; i++) {
        try {
          const rawProduct = products[i];
          const processedProduct = this.processProductData(rawProduct);
          
          // Validate product data
          const validatedProduct = insertProductSchema.parse(processedProduct);
          
          // Check if product exists (by reference or barcode)
          const existingProduct = await this.findExistingProduct(validatedProduct);
          
          if (existingProduct) {
            // Update existing product
            await storage.updateProduct(existingProduct.recordid!, validatedProduct);
          } else {
            // Create new product
            await storage.createProduct(validatedProduct);
          }
          
          results.imported++;
        } catch (error) {
          results.success = false;
          results.errors.push({
            row: i + 1,
            product: products[i],
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      results.message = results.success
        ? `Successfully imported ${results.imported} products`
        : `Imported ${results.imported} products with ${results.errors.length} errors`;

      return results;
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [{
          row: 0,
          product: null,
          error: error instanceof Error ? error.message : 'Failed to parse CSV file'
        }],
        message: 'Import failed: Invalid CSV format or file corruption'
      };
    }
  }

  /**
   * Process and clean product data from CSV
   */
  private processProductData(rawProduct: any): any {
    const processed = { ...rawProduct };

    // Convert numeric fields
    const numericFields = [
      'recordid', 'poids', 'volume', 'stock', 'stockMin', 'stockMax',
      'prixAchat', 'pv1Ht', 'pv2Ht', 'pv3Ht', 'pv1Ttc', 'pv2Ttc', 'pv3Ttc',
      'taux', 'remise', 'promo', 'active'
    ];

    numericFields.forEach(field => {
      if (processed[field] !== undefined && processed[field] !== '') {
        const value = parseFloat(processed[field]);
        processed[field] = isNaN(value) ? 0 : value;
      }
    });

    // Convert boolean-like fields
    if (processed.promo !== undefined) {
      processed.promo = this.convertToBoolean(processed.promo);
    }
    if (processed.active !== undefined) {
      processed.active = this.convertToBoolean(processed.active);
    }

    // Clean string fields
    const stringFields = [
      'codeBarre', 'cbCaisse', 'refProduit', 'produit', 'detaille',
      'famille', 'sousFamille', 'marque', 'modele', 'couleur', 'taille', 'photo'
    ];

    stringFields.forEach(field => {
      if (processed[field] !== undefined) {
        processed[field] = String(processed[field]).trim();
      }
    });

    // Remove recordid for new products (will be auto-generated)
    if (!processed.recordid || processed.recordid === '0') {
      delete processed.recordid;
    }

    return processed;
  }

  /**
   * Convert various boolean representations to number (1 or 0)
   */
  private convertToBoolean(value: any): number {
    if (typeof value === 'number') return value > 0 ? 1 : 0;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return ['1', 'true', 'yes', 'y', 'on'].includes(lower) ? 1 : 0;
    }
    return 0;
  }

  /**
   * Find existing product by reference or barcode
   */
  private async findExistingProduct(product: any): Promise<Product | null> {
    try {
      const products = await storage.getProducts({});
      
      // First try to find by product reference
      if (product.refProduit) {
        const existing = products.find(p => p.refProduit === product.refProduit);
        if (existing) return existing;
      }
      
      // Then try to find by barcode
      if (product.codeBarre) {
        const existing = products.find(p => p.codeBarre === product.codeBarre);
        if (existing) return existing;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get download path for exported file
   */
  async getExportFilePath(filename: string): Promise<string | null> {
    const filepath = path.join(this.uploadsDir, filename);
    
    try {
      await fs.access(filepath);
      return filepath;
    } catch {
      return null;
    }
  }

  /**
   * Clean up old export files
   */
  async cleanupOldExports(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith('products-export-')) {
          const filepath = path.join(this.uploadsDir, file);
          const stats = await fs.stat(filepath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filepath);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old exports:', error);
    }
  }

  /**
   * Generate CSV template for import
   */
  async generateCSVTemplate(): Promise<BulkExportResult> {
    try {
      const filename = `products-import-template-${Date.now()}.csv`;
      const filepath = path.join(this.uploadsDir, filename);

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: [
          { id: 'codeBarre', title: 'Barcode' },
          { id: 'refProduit', title: 'Product Reference' },
          { id: 'produit', title: 'Product Name' },
          { id: 'detaille', title: 'Description' },
          { id: 'famille', title: 'Family' },
          { id: 'marque', title: 'Brand' },
          { id: 'stock', title: 'Stock' },
          { id: 'pv1Ht', title: 'Selling Price 1 (HT)' },
          { id: 'promo', title: 'Promotion (1=Yes, 0=No)' },
          { id: 'active', title: 'Active (1=Yes, 0=No)' }
        ]
      });

      // Write sample data
      await csvWriter.writeRecords([
        {
          codeBarre: '1234567890',
          refProduit: 'PROD001',
          produit: 'Sample Product',
          detaille: 'This is a sample product description',
          famille: 'Electronics',
          marque: 'SampleBrand',
          stock: '10',
          pv1Ht: '99.99',
          promo: '0',
          active: '1'
        }
      ]);

      return {
        success: true,
        filename,
        count: 1,
        message: `Template generated successfully: ${filename}`
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
}

export const bulkImportExportService = new BulkImportExportService();