import { Injectable } from "@angular/core";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Cart, Order } from './order.service';
import { ThuChi } from './thuChi.service';
import { Wallet } from './wallet.service';
import { School } from './school.service';

@Injectable()
export class ExportCsvService {
  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) {

  }


  /**
   * Tổng tiền theo nhóm order
   * @param orders
   */
  tongTienByOrders(orders: Order[]) {
    let total = 0;
    orders.forEach((o: Order) => {
      total += this.calculatorOrderPrice(o);
    });
    return total;
  }

  /**
   * Tổng tiền 1 order
   * @param order
   */
  tongTienByOrder(order: Order) {
    return this.calculatorOrderPrice(order);
  }

  calculatorOrderPrice(o: Order) {
    let total = 0;
    if (!o) {
      return 0;
    }
    o.item.forEach((item: Cart) => {
      total += (item.qty - this.getQtyReturn(item.qtyReturn)) * item.price;
    });
    return total;
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

  /**
   * Doanh thu theo khách hàng
   * @param ws
   * @param data
   */
  prepareCongNoTong1(ws, data) {
    const rows = [];
    let placeNameKey = '';
    data.order.forEach((o: Order, idx) => {
      if (idx === 0) {
        placeNameKey = o?.school?.key;
      }
      if (placeNameKey !== o?.school?.key) {
        // Thêm 1 row để tách biệt giữa các trường
        rows.push(['', '', '', '']);
        placeNameKey = o?.school?.key;
      }
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

  exportToExcelBySchoolOrCustomer(data: any, fileName: string) {
    console.log(data);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(data?.sheetName ?? 'Tổng thanh toán');
    this.prepareTongThanhToan(worksheet, data);
    data.school.forEach((orders: Order[]) => {
      let ws = workbook.addWorksheet(orders[0]?.school?.name);
      this.prepareDoanhThuTheoDiaDiem(ws, orders);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, `${fileName}.xlsx`);
    });
  }

  prepareTongThanhToan(ws, data) {
    const rows = [];
    let rowCount = 1;
    let fillRows = [];
    let mergeCells = [];
    let tongHop = [];
    let totalPrice = 0;
    data.school.forEach((orders: Order[], idx: number) => {
      let totalBySchool = 0;
      let schoolName = '';
      let mergeMinCell = rowCount + 1;
      let mergeMaxCell = rowCount + orders.length;
      rowCount += orders.length;
      // Thêm từng ngày cho mỗi school
      orders.forEach((o: Order) => {
        schoolName = o?.school?.name;
        let total = 0;
        o.item.forEach((item: Cart) => {
          total += (item.qty - (item.qtyReturn ?? 0)) * item.price;
        });
        totalBySchool += total;
        totalPrice += total;
        rows.push([
          this.datePipe.transform(new Date(o.date), 'dd/MM/YYYY'),
          o.school.name,
          total,
        ]);
      });
      if (idx < data.school.length - 1) {
        // Add empty row
        rows.push(['', '', totalBySchool]);
        rowCount++;
        fillRows.push(rowCount);
      }
      mergeCells.push({min: mergeMinCell, max: mergeMaxCell});
      tongHop.push({name: schoolName, price: totalBySchool});
    });
    // Add thêm cột tổng bên các trường
    rows.push(['TỔNG', 'Tổng', totalPrice]);
    this.mergedCol(ws, {min: rowCount + 1, max: rowCount + 1}, 'A', 'B');
    // Bảng chi tiết các trường theo từng ngày
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
        {name: 'ĐỊA ĐIỂM', filterButton: true},
        {name: 'TỔNG TIỀN', filterButton: false},
      ],
      rows: rows,
    });
    this.fillRowsColor(ws, fillRows, 'eaaf74');
    this.fillRowColor(ws, rowCount + 1, 'ffff00');
    this.fillRowText(ws, rowCount + 1, 16, false, true, false, 'ff0000');

    // Format Price
    this.formatColByVND(ws, 'C');
    // Merge row
    this.mergedRow(ws, mergeCells, 'B');
    this.colAlignment(ws, 'B', 'middle', 'left');
    this.setFontHeader(ws, ['A1', 'B1', 'C1']);

    // Thêm bảng tổng kết
    const rowTotal = [];
    tongHop.forEach(item => {
      rowTotal.push([
        item.name,
        item.price,
      ]);
    });
    rowTotal.push(['Tổng', totalPrice]);

    ws.addTable({
      name: 'CongNoTheoDanhSach_Total',
      ref: 'E5',
      headerRow: false,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: 'Địa Điểm', filterButton: false},
        {name: 'TỔNG', filterButton: false},
      ],
      rows: rowTotal,
    });
    this.formatColByVND(ws, 'F');
    this.fillCellColor(ws.getCell('E' + (data.school.length + 5)), 'ffff00');
    this.fillCellColor(ws.getCell('F' + (data.school.length + 5)), 'ffff00');
    this.cellFillTextStyle(ws.getCell('E' + (data.school.length + 5)), 16, false, true, false, 'ff0000');
    this.cellFillTextStyle(ws.getCell('F' + (data.school.length + 5)), 16, false, true, false, 'ff0000');

    this.minWidthForColumn(ws);
    this.colDateWidth(ws, 'A');
    this.colDiaDiemWidth(ws, 'B');
    this.colDiaDiemWidth(ws, 'E');
    this.colPriceWidth(ws, 'C');
    this.colDiaDiemWidth(ws, 'F');
    return ws;
  }

  prepareDoanhThuTheoDiaDiem(ws, orders: Order[]) {
    let rowCount = 1;
    const rows = [];
    const mergeCells = [];
    const fillRows = [];
    ws.mergeCells('A1:P1');
    const masterOrder = orders[0]?.master;
    const school: School = masterOrder?.school;
    ws.getCell('A1').value = school?.name;
    this.cellFillTextStyle(ws.getCell('A1'), 18, false, true, false, '000000');
    this.cellAlignment(ws, 'A1');
    rowCount += 2;
    let mergeMinCell = 0;
    let mergeMaxCell = 0;
    orders.forEach((o: Order) => {
      // Danh sách theo ngày ( table )
      Object.keys(o?.sItem).forEach(item => {
        const carts: Cart[] = o?.sItem[item];
        carts.forEach((cart: Cart) => {
          rows.push([
            this.datePipe.transform(new Date(o.date), 'dd/MM/YYYY'),
            cart.product.category.name,
            cart.product.name,
            cart.product.productType.name,
            cart.qty,
            this.getTotalReturnByItem(cart),
            cart.price,
            this.getTotalByItem(cart),
          ]);
        });
      });
      mergeMinCell = rowCount + 1;
      mergeMaxCell = rowCount + o?.item?.length;
      rows.push(['', '', '', '', '', '', '', this.tongTienByOrder(o)]);
      rowCount += o?.item?.length + 1;
      mergeCells.push({min: mergeMinCell, max: mergeMaxCell});
      fillRows.push(mergeMaxCell + 1);
    });

    ws.addTable({
      name: 'by_diadiem_' + school?.name,
      ref: 'A3',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: 'Ngày', filterButton: true},
        {name: 'Sản Phẩm', filterButton: true},
        {name: ' ', filterButton: false},
        {name: 'Đơn vị', filterButton: true},
        {name: 'Số Lượng Giao', filterButton: true},
        {name: 'Số Lượng Trả', filterButton: true},
        {name: 'Đơn giá', filterButton: true},
        {name: 'Tổng', filterButton: false},
      ],
      rows: rows,
    });
    this.formatColByVND(ws, 'G');
    this.formatColByVND(ws, 'H');
    this.setFontHeader(ws, ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3']);
    ws.mergeCells('B3:C3');
    // Merge row
    this.mergedRow(ws, mergeCells, 'A');
    this.fillRowsColor(ws, fillRows, 'eaaf74');
    this.colAlignment(ws, 'A', 'middle', 'center');
    this.colAlignment(ws, 'D', 'middle', 'center');
    this.colAlignment(ws, 'E', 'middle', 'center');
    this.colAlignment(ws, 'F', 'middle', 'center');
    // Add row TOTAL
    ws.mergeCells('A' + (rowCount + 1) + ':' + 'G' + (rowCount + 1));
    this.cellFillValue(ws, 'A' + (rowCount + 1), 'TỔNG');
    this.cellFillValue(ws, 'H' + (rowCount + 1), this.tongTienByOrders(orders));
    this.fillCellColor(ws.getCell('A' + (rowCount + 1)), 'ffff00');
    this.fillCellColor(ws.getCell('H' + (rowCount + 1)), 'ffff00');
    this.cellFillTextStyle(ws.getCell('A' + (rowCount + 1)), 16, false, true, false, 'ff0000');
    this.cellFillTextStyle(ws.getCell('H' + (rowCount + 1)), 16, false, true, false, 'ff0000');

    // THÊM BẢNG TỔNG KẾT
    rowCount = 3;
    const rowTotal = [];
    Object.keys(masterOrder?.sItem).forEach(item => {
      const carts: Cart[] = masterOrder?.sItem[item];
      carts.forEach((cart: Cart) => {
        rowTotal.push([
          cart.product.category.name,
          cart.product.name,
          cart.product.productType.name,
          cart.qty,
          this.getTotalReturnByItem(cart),
          cart.price,
          this.getTotalByItem(cart),
        ]);
      });
    });
    rowCount += masterOrder?.item?.length;
    ws.addTable({
      name: 'by_diadiem_total_' + school?.name,
      ref: 'J3',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        {name: 'Sản Phẩm', filterButton: true},
        {name: ' ', filterButton: false},
        {name: 'Đơn vị', filterButton: true},
        {name: 'Số Lượng Giao', filterButton: true},
        {name: 'Số Lượng Trả', filterButton: true},
        {name: 'Đơn giá', filterButton: true},
        {name: 'Tổng', filterButton: false},
      ],
      rows: rowTotal,
    });
    this.formatColByVND(ws, 'O');
    this.formatColByVND(ws, 'P');
    this.colAlignment(ws, 'L', 'middle', 'center');
    this.colAlignment(ws, 'M', 'middle', 'center');
    this.colAlignment(ws, 'N', 'middle', 'center');
    ws.mergeCells('J' + (rowCount + 1) + ':' + 'O' + (rowCount + 1));
    this.cellFillValue(ws, 'J' + (rowCount + 1), 'TỔNG');
    this.cellFillValue(ws, 'P' + (rowCount + 1), this.tongTienByOrders(orders));
    this.fillCellColor(ws.getCell('J' + (rowCount + 1)), 'ffff00');
    this.fillCellColor(ws.getCell('P' + (rowCount + 1)), 'ffff00');
    this.cellFillTextStyle(ws.getCell('J' + (rowCount + 1)), 16, false, true, false, 'ff0000');
    this.cellFillTextStyle(ws.getCell('P' + (rowCount + 1)), 16, false, true, false, 'ff0000');

    this.minWidthForColumn(ws);
    this.colDateWidth(ws, 'A');
    this.colPriceWidth(ws, 'B');
    this.colProductNameWidth(ws, 'C');
    this.colPriceWidth(ws, 'D');
    this.colProductNameWidth(ws, 'E');
    this.colProductNameWidth(ws, 'F');
    this.colPriceWidth(ws, 'G');
    this.colPriceWidth(ws, 'H');
    this.colPriceWidth(ws, 'J');
    this.colProductNameWidth(ws, 'K');
    this.colPriceWidth(ws, 'L');
    this.colProductNameWidth(ws, 'M');
    this.colProductNameWidth(ws, 'N');
    this.colPriceWidth(ws, 'O');
    this.colPriceWidth(ws, 'P');
    return ws;
  }

  fillRowsColor(ws, fillRows, color) {
    fillRows.forEach((rowNumber) => {
      const row = ws.getRow(rowNumber);
      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'darkVertical',
          fgColor: {argb: color}
        };
      });
    });
  }

  fillRowColor(ws, rowNumber, color) {
    const row = ws.getRow(rowNumber);
    row.eachCell((cell, colNumber) => {
      this.fillCellColor(cell, color);
    });
  }

  fillCellColor(cell, color) {
    cell.fill = {
      type: 'pattern',
      pattern: 'darkVertical',
      fgColor: {argb: color}
    };
  }

  fillRowText(ws, rowNumber, size, underline, bold, italic, color) {
    const row = ws.getRow(rowNumber);
    row.eachCell((cell, colNumber) => {
      this.cellFillTextStyle(cell, size, underline, bold, italic, color);
    });
  }

  cellFillTextStyle(cell, size, underline, bold, italic, color) {
    cell.font = {
      size: size,
      underline: false,
      bold: bold,
      color: {argb: color},
      italic: italic
    };
  }

  formatColByVND(ws, colName) {
    ws.getColumn(colName).numFmt = '#,##0 [$đ];-#,##0 [$đ]';
  }

  mergedRow(ws, mergeCells, colName) {
    mergeCells.forEach(item => {
      ws.mergeCells(colName + item.min, colName + item.max);
    });
  }

  mergedCol(ws, mergeCols, fromColName, toColNam) {
    ws.mergeCells(fromColName + mergeCols.min, toColNam + mergeCols.max);
  }

  colAlignment(ws, colName, vertical = 'middle', horizontal = 'left') {
    ws.getColumn(colName).alignment = {vertical: vertical, horizontal: horizontal};
  }

  cellAlignment(ws, cellName, vertical = 'middle', horizontal = 'left') {
    ws.getCell(cellName).alignment = {vertical: vertical, horizontal: horizontal};
  }

  cellFillValue(ws, cellName, value) {
    ws.getCell(cellName).value = value;
  }

  minWidthForColumn(ws) {
    ws.columns.forEach(column => {
      column.width = 12;
    });
  }
  colDateWidth(ws, colName) {
    ws.getColumn(colName).width = 15;
  }
  colDiaDiemWidth(ws, colName) {
    ws.getColumn(colName).width = 20;
  }
  colPriceWidth(ws, colName) {
    ws.getColumn(colName).width = 13;
  }
  colProductNameWidth(ws, colName) {
    ws.getColumn(colName).width = 18;
  }

}
