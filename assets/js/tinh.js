/* ==========================================================================
   tinh.js - Nap tham so cua tinh
   --------------------------------------------------------------------------
   Phai nap TRUOC moi tep JavaScript khac, vi cac tep do deu can ten tinh,
   pham vi ban do va danh sach lop co san.

   Tep tinh.json o goc du an la nguon su that duy nhat: scripts/tinh.py doc
   cung tep do, nen khong bao gio lech giua Python va trinh duyet. Doi tinh,
   doi ten don vi hay doi pham vi ban do deu chi sua mot cho do.

   Moi trang phai khai bao bien GOC_TRANG truoc khi nap tep nay:
     index.html          -> var GOC_TRANG = '';
     pages/thong-ke.html -> var GOC_TRANG = '../';
   ========================================================================== */

var TINH = null;


/* --------------------------------------------------------------------------
   Nap tham so, tra ve Promise
   -------------------------------------------------------------------------- */
function nap_tinh() {
  return fetch(GOC_TRANG + 'tinh.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Không đọc được tệp tinh.json');
      return r.json();
    })
    .then(function (tt) {
      TINH = tt;
      ap_dung_ten_tinh();
      return tt;
    });
}


/* --------------------------------------------------------------------------
   Duong dan den mot tep du lieu
   -------------------------------------------------------------------------- */
function duong_dan_du_lieu(ten_tep) {
  return GOC_TRANG + 'data/' + ten_tep;
}

/* Lop da co du lieu hay chua. Luc moi lap he thong thuong chi co vai lop nen
   khong the gia dinh lop nao cung ton tai. */
function lop_co_san(ma_lop) {
  if (!TINH || !TINH.lop_co_san) return true;
  return TINH.lop_co_san.indexOf(ma_lop) >= 0;
}


/* --------------------------------------------------------------------------
   Dien ten tinh vao giao dien
   Moi cho can thay ten chi viec dat thuoc tinh data-tinh trong HTML,
   gia tri la ten truong trong tinh.json.
   -------------------------------------------------------------------------- */
function ap_dung_ten_tinh() {
  var cac_o = document.querySelectorAll('[data-tinh]');
  for (var i = 0; i < cac_o.length; i++) {
    var truong = cac_o[i].getAttribute('data-tinh');
    if (TINH[truong] !== undefined) cac_o[i].textContent = TINH[truong];
  }

  var tieu_de = document.querySelector('title');
  if (tieu_de) {
    tieu_de.textContent = tieu_de.textContent.replace(/\{ten\}/g, TINH.ten_ngan);
  }
}
