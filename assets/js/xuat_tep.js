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

/* Moi lan xuat tep deu di qua day, nen khoa mat khau chi dat mot cho nay la
   phu het CSV va GeoJSON cua ca bon trang. */
function tai_ve_tep(ten_tep, noi_dung, kieu_mime) {
  yeu_cau_mat_khau_xuat(function () {
    ghi_tep_ve_may(ten_tep, noi_dung, kieu_mime);
  });
}


/* --------------------------------------------------------------------------
   Khoa mat khau cho viec xuat tep
   --------------------------------------------------------------------------
   tinh.json giu truong ma_bam_mat_khau_xuat = SHA-256(TIEN_TO_BAM_XUAT + mat
   khau), dat bang scripts/11_dat_mat_khau_xuat.py. Khong co truong do thi
   xuat tu do nhu truoc.

   GIOI HAN PHAI BIET: trang la web tinh, trinh duyet da tai san cac tep
   GeoJSON trong data/ de ve ban do. Khoa nay chi chan cac NUT XUAT; no khong
   bao ve du lieu khoi nguoi biet mo duong dan data/*.geojson. Muon bao ve
   that thi du lieu phai nam sau mot may chu co xac thuc.

   Nhap dung mot lan thi khong hoi lai cho den khi dong the trinh duyet.
   -------------------------------------------------------------------------- */
var TIEN_TO_BAM_XUAT = 'tnn-xuat-tep:';
var KHOA_NHO_XUAT = 'da_mo_khoa_xuat';

function ma_bam_xuat() {
  if (typeof TINH === 'undefined' || !TINH) return '';
  return TINH.ma_bam_mat_khau_xuat || '';
}

function da_mo_khoa_xuat() {
  try {
    return sessionStorage.getItem(KHOA_NHO_XUAT) === ma_bam_xuat();
  } catch (e) { return false; }
}

/* Tra ve Promise chuoi hex SHA-256 */
function bam_sha256(chuoi) {
  var du_lieu = new TextEncoder().encode(chuoi);
  return crypto.subtle.digest('SHA-256', du_lieu).then(function (bo_dem) {
    var mang = new Uint8Array(bo_dem);
    var hex = '';
    for (var i = 0; i < mang.length; i++) {
      hex += ('0' + mang[i].toString(16)).slice(-2);
    }
    return hex;
  });
}

function yeu_cau_mat_khau_xuat(khi_dung) {
  if (!ma_bam_xuat() || da_mo_khoa_xuat()) { khi_dung(); return; }

  /* crypto.subtle chi co tren https va localhost */
  if (!window.crypto || !crypto.subtle) {
    mo_hop_thoai('Xuất dữ liệu',
      '<p>Trình duyệt không kiểm tra được mật khẩu trên kết nối này. '
      + 'Hãy mở trang qua <code>https</code> hoặc <code>localhost</code>.</p>');
    return;
  }

  mo_hop_thoai('Xuất dữ liệu',
    '<form id="bieu-mat-khau-xuat" class="bieu-mat-khau">'
    + '<label class="nhan-nho" for="o-mat-khau-xuat">'
    + 'Nhập mật khẩu để tải dữ liệu về máy</label>'
    + '<input type="password" id="o-mat-khau-xuat" autocomplete="off">'
    + '<p class="bieu-mat-khau__loi" id="loi-mat-khau-xuat" hidden>'
    + 'Mật khẩu không đúng.</p>'
    + '<div class="hang-nut">'
    + '<button type="submit" class="nut nut--chinh">Tải về</button>'
    + '<button type="button" class="nut" id="huy-mat-khau-xuat">Hủy</button>'
    + '</div></form>');

  var o = document.getElementById('o-mat-khau-xuat');
  var loi = document.getElementById('loi-mat-khau-xuat');
  o.focus();

  document.getElementById('huy-mat-khau-xuat').onclick = dong_hop_thoai;
  /* Trang thong ke khong co ma gan nut dong cua hop thoai, nen gan o day */
  document.getElementById('dong-hop-thoai').onclick = dong_hop_thoai;

  document.getElementById('bieu-mat-khau-xuat').onsubmit = function (su_kien) {
    su_kien.preventDefault();
    bam_sha256(TIEN_TO_BAM_XUAT + o.value).then(function (hex) {
      if (hex !== ma_bam_xuat()) {
        loi.hidden = false;
        o.value = '';
        o.focus();
        return;
      }
      try { sessionStorage.setItem(KHOA_NHO_XUAT, hex); } catch (e) { /* bo qua */ }
      dong_hop_thoai();
      khi_dung();
    });
  };
}


function ghi_tep_ve_may(ten_tep, noi_dung, kieu_mime) {
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
