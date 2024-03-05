import { Injectable } from "@angular/core";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Cart, Order } from './order.service';
import { ThuChi } from './thuChi.service';
import { Wallet } from './wallet.service';

@Injectable()
export class ExportCsvService {
  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
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
    const worksheet = workbook.addWorksheet(data?.sheetName ?? 'Công nợ');
    this.prepareCongNoTong(worksheet, data);

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, `${fileName}.xlsx`);
    });
  }

  exportCongNoTong1(data: any, fileName: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(data?.sheetName ?? 'Công nợ');
    this.prepareCongNoTong1(worksheet, data);

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
      bold: true,
    };
    ws.getCell('A1').alignment = {wrapText: true};

    ws.mergeCells('E1:G1');
    ws.getCell('F1').value = data.totalPrice;
    ws.getCell('F1').font = {
      size: 14,
      bold: true,
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
    this.setFontHeader(ws, ['A3', 'C3', 'D3', 'E3', 'F3', 'G3']);
    // ROWs
    Object.entries(data.order.sItem).forEach(([key, cart], index) => {
      const item: Cart[] = <Cart[]>cart;
      item.forEach((c: Cart) => {
        ws.addRow([c.product.category.name,
          c.product.name,
          c.product.productType.name,
          c.qty,
          this.getTotalReturnByItem(c),
          c.price,
          this.getTotalByItem(c),
        ]);
      });
    });

    ws.getColumn(3).alignment = {horizontal: 'center'};
    ws.getColumn(4).alignment = {horizontal: 'center'};
    ws.getColumn(5).alignment = {horizontal: 'center'};
    return ws;
  }

  prepareCongNoTong1(ws, data) {
    // Header
    // ws.getCell('A1').value = 'NGÀY';
    // ws.getCell('B1').value = 'KHÁCH HÀNG';
    // ws.getCell('C1').value = 'ĐỊA ĐIỂM';
    // ws.getCell('D1').value = 'TỔNG TIỀN';
    // this.setFontHeader(ws, ['A1', 'B1', 'C1', 'D1'])
    // // ROWs
    // data.order.forEach((o: Order) => {
    //   let total = 0;
    //   o.item.forEach((item: Cart) => {
    //     total += (item.qty - (item.qtyReturn ?? 0)) * item.price;
    //   });
    //   ws.addRow([
    //     o.date,
    //     o.customer.name,
    //     o.school.name,
    //     total
    //   ]);
    // });
    const rows = [];
    data.order.forEach((o: Order) => {
      let total = 0;
      o.item.forEach((item: Cart) => {
        total += (item.qty - (item.qtyReturn ?? 0)) * item.price;
      });
      rows.push([
        this.datePipe.transform(new Date(o.date), 'dd/MM/YYYY'),
        o.customer.name,
        o.school.name,
        total,
      ]);
    });
    ws.addTable({
      name: 'CongNoTheoDanhSach',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: 'NGÀY', filterButton: true},
        {name: 'KHÁCH HÀNG', filterButton: true},
        {name: 'ĐỊA ĐIỂM', filterButton: true},
        {name: 'TỔNG TIỀN', filterButton: false},
      ],
      rows: rows,
    });
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
        wrapText: true,
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

  exportThuChi(data: any, fileName: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheetWallet = workbook.addWorksheet('VÍ');
    const worksheetThu = workbook.addWorksheet('THU');
    const worksheetChi = workbook.addWorksheet('CHI');
    this.prepareWallet(worksheetWallet, data);
    this.prepareThu(worksheetThu, data);
    this.prepareChi(worksheetChi, data);

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, `${fileName}.xlsx`);
    });
  }

  prepareWallet(ws, data) {
    const rows = [];
    data.wallets.forEach((o: Wallet, idx: number) => {
      rows.push([
        idx + 1,
        o?.name,
        o?.cashTotal,
        o?.bankTotal,
        o?.cashTotal + o?.bankTotal,
      ]);
    });
    ws.addTable({
      name: 'Wallet',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: '#', filterButton: true},
        {name: 'TÊN', filterButton: true},
        {name: 'TIỀN MẶT', filterButton: true},
        {name: 'TIỀN TTK', filterButton: true},
        {name: 'TỔNG', filterButton: true},
      ],
      rows: rows,
    });
    ws.getColumn(3).numFmt = '#,##0 [$VNĐ];-#,##0 [$VNĐ]';
    ws.getColumn(4).numFmt = '#,##0 [$VNĐ];-#,##0 [$VNĐ]';
    ws.getColumn(5).numFmt = '#,##0 [$VNĐ];-#,##0 [$VNĐ]';
    return ws;
  }

  prepareChi(ws, data) {
    const rows = [];
    ws.getCell('A1').value = 'TỔNG ';
    ws.getCell('B1').value = this.currencyPipe.transform(data?.priceFilter?.chi, '', '', '1.0-0') + ' VNĐ';
    ws.getCell('B1').font = {
      size: 14,
      bold: true,
    };
    data.tongChi.forEach((o: ThuChi) => {
      rows.push([
        this.datePipe.transform(new Date(o.date), 'dd/MM/YYYY'),
        o?.name,
        o?.soLuong,
        o?.price,
        o?.ttLuong ? 'YES' : 'NO',
        o?.wallet?.name,
        o?.paymentTypeLabel,
        o?.note,
      ]);
    });
    ws.addTable({
      name: 'thu-chi',
      ref: 'A2',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: 'NGÀY', filterButton: true},
        {name: 'KHOẢN CHI', filterButton: true},
        {name: 'SỐ LƯỢNG', filterButton: true},
        {name: 'SỐ TIỀN', filterButton: true},
        {name: 'TT LƯƠNG?', filterButton: true},
        {name: 'NGUỒN VÍ', filterButton: true},
        {name: 'HÌNH THỨC THANH TOÁN', filterButton: true},
        {name: 'GHI CHÚ', filterButton: true},
      ],
      rows: rows,
    });
    ws.getColumn(4).numFmt = '#,##0 [$VNĐ];-#,##0 [$VNĐ]';
    return ws;
  }

  prepareThu(ws, data) {
    const rows = [];
    ws.getCell('A1').value = 'TỔNG THU';
    ws.getCell('B1').value = this.currencyPipe.transform(data?.priceFilter?.tienDaThu, '', '', '1.0-0') + ' VNĐ';
    ws.getCell('A2').value = 'TỔNG CHƯA THU';
    ws.getCell('B2').value = this.currencyPipe.transform(data?.priceFilter?.tienChuaThu, '', '', '1.0-0') + ' VNĐ';
    ws.getCell('B1').font = {
      size: 14,
      bold: true,
    };
    ws.getCell('B2').font = {
      size: 14,
      bold: true,
    };
    data.tongThu.forEach((o: ThuChi) => {
      rows.push([
        this.datePipe.transform(new Date(o.date), 'dd/MM/YYYY'),
        o?.name,
        o?.customer?.name,
        o?.price,
        o?.trangThaiLabel,
        o?.wallet?.name,
        o?.paymentTypeLabel,
        o?.note,
      ]);
    });
    ws.addTable({
      name: 'thu',
      ref: 'A3',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: 'NGÀY', filterButton: true},
        {name: 'KHOẢN THU', filterButton: true},
        {name: 'ĐỐI TÁC', filterButton: true},
        {name: 'SỐ TIỀN', filterButton: true},
        {name: 'TRẠNG THÁI', filterButton: true},
        {name: 'NGUỒN VÍ', filterButton: true},
        {name: 'HÌNH THỨC THANH TOÁN', filterButton: true},
        {name: 'GHI CHÚ', filterButton: true},
      ],
      rows: rows,
    });
    ws.getColumn(4).numFmt = '#,##0 [$VNĐ];-#,##0 [$VNĐ]';
    return ws;
  }
}
