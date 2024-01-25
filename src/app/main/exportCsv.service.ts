import { Injectable } from "@angular/core";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { Cart } from './order.service';

@Injectable()
export class ExportCsvService {
  constructor(
    private datePipe: DatePipe,
  ) {

  }

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
    // Thêm 1 dòng trống
    ws.addRow('');
    return ws;
  }

  exportCongNoTong(data: any, fileName: string) {
    const workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet(data?.sheetName ?? 'Công nợ');
    this.prepareCongNoTong(worksheet, data);

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, `${fileName}.xlsx`);
    });
  }

  prepareCongNoTong(ws, data) {
    ws.mergeCells('A1:C1');
    ws.getCell('A1').value = data.date.start + ' - ' + data.date.end;
    ws.getCell('A1').font = {
      size: 12,
      bold: true
    };
    ws.getCell('A1').alignment = {wrapText: true};

    ws.mergeCells('E1:G1');
    ws.getCell('F1').value = data.totalPrice;
    ws.getCell('F1').font = {
      size: 14,
      bold: true
    };
    ws.getCell('F1').alignment = {wrapText: true};
    ws.addRow('');
    // Header
    ws.mergeCells('A3:B3');
    ws.getCell('A3').value = 'Sản Phẩm';
    ws.getCell('C3').value = 'Đơn vị tính';
    ws.getCell('D3').value = 'Số Lượng Giao';
    ws.getCell('E3').value = 'Số Lượng Trả';
    ws.getCell('F3').value = 'Giá bán';
    ws.getCell('G3').value = 'Tổng';
    this.setFontHeader(ws, ['A3', 'C3', 'D3', 'E3', 'F3', 'G3'])
    // ROWs
    Object.entries(data.order.sItem).forEach(([key, cart], index) => {
      const item: Cart[] = <Cart[]>cart;
      item.forEach((cart: Cart) => {
        ws.addRow([cart.product.category.name,
          cart.product.name,
          cart.product.productType.name,
          cart.qty,
          this.getTotalReturnByItem(cart),
          cart.price,
          this.getTotalByItem(cart)
        ]);
      });
    });

    ws.getColumn(3).alignment = {horizontal: 'center'};
    ws.getColumn(4).alignment = {horizontal: 'center'};
    ws.getColumn(5).alignment = {horizontal: 'center'};
    return ws;
  }

  setFontHeader(ws, cells) {
    cells.forEach((cell: string) => {
      ws.getCell(cell).font = {
        size: 12,
        bold: true,
      };
      ws.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });
    return ws;
  }

  getTotalReturnByItem(item: Cart) {
    return (item.qtyReturn > 0) ? item.qtyReturn : '';
  }

  getTotalByItem(item: Cart) {
    return (item.qty - this.getQtyReturn(item.qtyReturn)) * item.price;
  }

  getQtyReturn(qtyReturn: any) {
    if (qtyReturn === '' || qtyReturn === ' ') {
      return 0;
    }
    return qtyReturn;
  }
}
