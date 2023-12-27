import { Injectable } from "@angular/core";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable()
export class ExportCsvService {

  exportToExcel(data: any[], fileName: string) {
    const workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('TỔNG THANH TOÁN');
    worksheet = this.prepareHeaderTextGlobal(worksheet);
    worksheet = this.prepareSchoolData(worksheet, data);


    let worksheet1 = workbook.addWorksheet('Trường ABC');
    worksheet1 = this.prepareSchoolData(worksheet1, data);

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, `${fileName}.xlsx`);
    });
  }

  prepareSchoolData(worksheet, data) {// Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Add data
    data.forEach((item) => {
      const row: any = [];
      headers.forEach((header) => {
        row.push(item[header]);
      });
      worksheet.addRow(row);
    });

    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 20;
    worksheet.getCell('A1').alignment = {vertical: 'middle', horizontal: 'center'};
    return worksheet;
  }

  prepareHeaderTextGlobal(ws) {
    ws.addRow('');
    ws.mergeCells('A2:F2');
    ws.getCell('A2').value = 'Nhà phân phối, chế biển thực phẩm Nguyễn Đỉnh';
    ws.getCell('A2').font = {
      size: 14,
      // bold: true,
    };

    ws.mergeCells('A3:F3');
    ws.getCell('A3').value = 'STK: 9968985321- Ngân hàng Vietcombank-Trần Kim Định';
    ws.getCell('A3').font = {
      size: 14,
      // bold: true,
    };
    ws.addRow('');
    return ws;
  }
}
