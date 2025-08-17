import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export function readExcelFile(filePath: string): any[] {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel file structure:');
    console.log('Number of rows:', data.length);
    
    if (data.length > 0) {
      console.log('Column headers:', Object.keys(data[0]));
      console.log('First row sample:', data[0]);
      if (data.length > 1) {
        console.log('Second row sample:', data[1]);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}

// Function to convert Excel to CSV
export function convertExcelToCSV(excelPath: string, csvPath: string): void {
  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to CSV
    const csvData = XLSX.utils.sheet_to_csv(worksheet);
    
    // Write CSV file
    fs.writeFileSync(csvPath, csvData, 'utf8');
    
    console.log(`Converted ${excelPath} to ${csvPath}`);
  } catch (error) {
    console.error('Error converting Excel to CSV:', error);
    throw error;
  }
}