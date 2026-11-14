/* ==========================================================================
   xuat_tep.js - Tien ich tai tep ve may, dung chung cho moi trang
   --------------------------------------------------------------------------
   Tach rieng khoi table.js de trang thong ke dung lai duoc ma khong phai nap
   ca bo ma nguon cua ban do. Quy uoc CSV chi dinh nghia mot cho duy nhat o
   day, tranh hai trang xuat ra hai kieu khac nhau.
   ========================================================================== */

/* Tao va tai xuong mot tep CSV.
   Them BOM UTF-8 o dau tep de Excel doc dung tieng Viet co dau.
   Dung dau phay lam dau phan cach theo chuan RFC 4180, moi o deu duoc dat
   trong ngoac kep nen GeoPandas, pandas va QGIS deu doc duoc truc tiep. */
function tai_ve_csv(ten_tep, cac_cot, cac_hang) {
  var dong = [cac_cot.map(boc_o_csv).join(',')];
  cac_hang.forEach(function (h) {
    dong.push(h.map(boc_o_csv).join(','));
  });
  var noi_dung = '﻿' + dong.join('\r\n');
  tai_ve_tep(ten_tep, noi_dung, 'text/csv;charset=utf-8');
}

function boc_o_csv(gia_tri) {
  var s = (gia_tri === null || gia_tri === undefined) ? '' : String(gia_tri);
  return '"' + s.replace(/"/g, '""') + '"';
}

function tai_ve_tep(ten_tep, noi_dung, kieu_mime) {
  var blob = new Blob([noi_dung], { type: kieu_mime });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = ten_tep;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  /* Giai phong bo nho sau khi trinh duyet da bat dau tai */
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);

  /* Trang ban do co thanh mach bao rieng, trang thong ke thi khong */
  if (typeof hien_mach_bao === 'function') {
    hien_mach_bao('Đã xuất tệp ' + ten_tep, 3000);
  }
}
