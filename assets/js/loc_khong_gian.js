/* ==========================================================================
   loc_khong_gian.js - Loc doi tuong theo mot vung: ranh gioi xa hoac da giac
   ve tay tren ban do
   --------------------------------------------------------------------------
   Vung loc la mot dieu kien cua BO_LOC, ngang hang voi loc luu vuc va tu khoa.
   Nho vay ban do, bang thuoc tinh, truy van nhap chuot va cac nut xuat tep
   deu tu ap dung ma khong phai sua gi them: tat ca di qua qua_bo_loc().

   Phep so la GIAO HINH HOC (turf.booleanIntersects), khong phai tam hinh hoc.
   Mot con song chay qua xa, mot ho nam vat ranh gioi deu duoc tinh.

   Ket qua giao duoc tinh MOT LAN khi dat vung roi luu vao BO_LOC.vung.trung,
   vi qua_bo_loc() duoc goi cho tung doi tuong o moi cu nhap chuot.
   ========================================================================== */

/* Nhom Leaflet chua vien cua vung loc. Tach khoi nhom_ve_phu vi huy_cong_cu()
   xoa sach nhom do moi khi doi cong cu. */
var nhom_vung_loc = null;

/* --------------------------------------------------------------------------
   Dat va xoa vung loc
   vung = { kieu: 'xa' | 've_tay', ma, ten, hinh_hoc }
   Tra ve true neu dat duoc.
   -------------------------------------------------------------------------- */
function dat_vung_loc(vung) {
  if (typeof turf === 'undefined') {
    hien_mach_bao('Không nạp được thư viện Turf.js nên chưa lọc theo vùng được. '
                + 'Kiểm tra kết nối mạng rồi tải lại trang.', 6000);
    return false;
  }

  xoa_vung_loc();

  var trung = {};
  Object.keys(LOP).forEach(function (ma_lop) {
    var l = LOP[ma_lop];
    if (l.loi || LOP_MIEN_LOC_VUNG[ma_lop]) return;
    trung[ma_lop] = tinh_trung_mot_lop(ma_lop, vung.hinh_hoc);
  });

  BO_LOC.vung = {
    kieu: vung.kieu, ma: vung.ma || '', ten: vung.ten,
    hinh_hoc: vung.hinh_hoc, trung: trung,
  };

  /* Ve vien vung de nguoi dung thay dang loc theo dau */
  if (!nhom_vung_loc) nhom_vung_loc = L.layerGroup().addTo(ban_do);
  L.geoJSON({ type: 'Feature', geometry: vung.hinh_hoc }, {
    style: { color: '#b45309', weight: 3, opacity: 0.95, dashArray: '8 5',
             fill: false },
    interactive: false,
  }).addTo(nhom_vung_loc);

  return true;
}

/* Tap chi so cac doi tuong cua mot lop giao voi vung, dang { chi_so: true }.
   Tach rieng de lop tai tre (xem tai_lop_tre() trong layers.js) tinh duoc
   phan cua minh khi no tai xong sau luc vung da duoc dat. */
function tinh_trung_mot_lop(ma_lop, hinh_hoc_vung) {
  var khung_vung = turf.bbox(hinh_hoc_vung);
  var trung = {};

  LOP[ma_lop].doi_tuong.forEach(function (dt) {
    /* Doi tuong khong co hinh hoc thi khong dinh vi duoc, coi nhu ngoai vung */
    if (!dt.hinh_hoc) return;

    /* Loc so bo bang khung bao truoc khi goi phep giao chinh xac */
    if (!dt.khung_bao) dt.khung_bao = turf.bbox(dt.hinh_hoc);
    if (!khung_bao_giao_nhau(dt.khung_bao, khung_vung)) return;

    try {
      if (turf.booleanIntersects(dt.hinh_hoc, hinh_hoc_vung)) {
        trung[dt.chi_so] = true;
      }
    } catch (e) {
      console.warn('Không xét được giao hình học cho ' + ma_lop
                 + ' #' + dt.chi_so + ': ' + e.message);
    }
  });

  return trung;
}

function xoa_vung_loc() {
  BO_LOC.vung = null;
  if (nhom_vung_loc) nhom_vung_loc.clearLayers();
}

/* Hai khung bao dang [tay, nam, dong, bac] co giao nhau khong */
function khung_bao_giao_nhau(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

/* --------------------------------------------------------------------------
   Chon theo xa
   -------------------------------------------------------------------------- */
function dung_bo_loc_xa() {
  var o = document.getElementById('loc-xa');
  var l = LOP['ranh_gioi_xa'];
  if (!o || !l || l.loi) return;

  var cac_xa = l.doi_tuong.filter(function (dt) { return dt.hinh_hoc; });
  cac_xa.sort(function (a, b) {
    return String(a.thuoc_tinh.ten).localeCompare(String(b.thuoc_tinh.ten), 'vi');
  });
  cac_xa.forEach(function (dt) {
    var opt = document.createElement('option');
    opt.value = dt.thuoc_tinh.ma;
    opt.textContent = dt.thuoc_tinh.ten;
    o.appendChild(opt);
  });
}

function dat_vung_loc_theo_xa(ma_xa) {
  var l = LOP['ranh_gioi_xa'];
  if (!l || l.loi) return false;
  var xa = l.doi_tuong.filter(function (dt) {
    return String(dt.thuoc_tinh.ma) === String(ma_xa);
  })[0];
  if (!xa || !xa.hinh_hoc) return false;

  return dat_vung_loc({
    kieu: 'xa', ma: String(ma_xa), ten: xa.thuoc_tinh.ten, hinh_hoc: xa.hinh_hoc,
  });
}

/* Dua ban do ve vua khung vung loc */
function phong_den_vung_loc() {
  if (!BO_LOC.vung) return;
  var k = turf.bbox(BO_LOC.vung.hinh_hoc);
  ban_do.fitBounds([[k[1], k[0]], [k[3], k[2]]], { padding: [40, 40] });
}

/* --------------------------------------------------------------------------
   Cong cu: ve da giac de chon
   Nhap de them dinh, nhap dup de khep vung, Esc de huy.
   -------------------------------------------------------------------------- */
var dinh_ve_vung = [];
var hinh_ve_vung = null;

function bat_dau_ve_vung() {
  dinh_ve_vung = [];
  hinh_ve_vung = null;
  nhom_ve_phu.clearLayers();
  /* Nhap dup dung de khep vung, khong duoc phong to ban do */
  ban_do.doubleClickZoom.disable();
  ban_do.on('click', xu_ly_click_ve_vung);
  ban_do.on('mousemove', xu_ly_move_ve_vung);
  ban_do.on('dblclick', ket_thuc_ve_vung);
  hien_mach_bao('Nhấp lần lượt các đỉnh của vùng. Nhấp đúp để khép vùng, Esc để huỷ.');
}

/* Duoc huy_cong_cu() trong map.js goi khi tat hoac doi cong cu */
function huy_ve_vung() {
  ban_do.off('click', xu_ly_click_ve_vung);
  ban_do.off('mousemove', xu_ly_move_ve_vung);
  ban_do.off('dblclick', ket_thuc_ve_vung);
  dinh_ve_vung = [];
  hinh_ve_vung = null;
  /* Bat lai sau khi su kien dblclick hien tai da xu ly xong, neu khong chinh
     cu nhap dup vua khep vung se lam ban do phong to. */
  setTimeout(function () {
    if (!cong_cu_dang_bat || cong_cu_dang_bat.ten !== 've_vung') {
      ban_do.doubleClickZoom.enable();
    }
  }, 0);
}

function xu_ly_click_ve_vung(e) {
  /* Mot cu nhap dup sinh ra hai su kien click tai cung mot cho. Bo qua dinh
     trung voi dinh ngay truoc do de vung khong co dinh lap. */
  var n = dinh_ve_vung.length;
  if (n > 0) {
    var p_cu = ban_do.latLngToContainerPoint(dinh_ve_vung[n - 1]);
    var p_moi = ban_do.latLngToContainerPoint(e.latlng);
    if (p_cu.distanceTo(p_moi) < 4) return;
  }

  dinh_ve_vung.push(e.latlng);
  L.circleMarker(e.latlng, {
    radius: 4, color: '#b45309', fillColor: '#fff', weight: 2, fillOpacity: 1,
  }).addTo(nhom_ve_phu);
  ve_xem_truoc_vung(dinh_ve_vung);
}

function xu_ly_move_ve_vung(e) {
  if (dinh_ve_vung.length === 0) return;
  ve_xem_truoc_vung(dinh_ve_vung.concat([e.latlng]));
}

function ve_xem_truoc_vung(cac_dinh) {
  if (hinh_ve_vung) nhom_ve_phu.removeLayer(hinh_ve_vung);
  hinh_ve_vung = L.polygon(cac_dinh, {
    color: '#b45309', weight: 2, dashArray: '6 4',
    fillColor: '#f59e0b', fillOpacity: 0.1, interactive: false,
  }).addTo(nhom_ve_phu);
}

function ket_thuc_ve_vung() {
  if (dinh_ve_vung.length < 3) {
    hien_mach_bao('Vùng cần ít nhất 3 đỉnh. Nhấp thêm đỉnh rồi nhấp đúp để khép.', 3500);
    return;
  }

  /* GeoJSON: toa do [kinh do, vi do], vong phai khep kin */
  var vong = dinh_ve_vung.map(function (ll) { return [ll.lng, ll.lat]; });
  vong.push(vong[0]);
  var hinh_hoc = { type: 'Polygon', coordinates: [vong] };

  /* Tat cong cu ve truoc khi ap bo loc */
  if (cong_cu_dang_bat) {
    document.getElementById(cong_cu_dang_bat.id_nut).classList.remove('dang-bat');
  }
  huy_cong_cu();

  /* Moi luc chi co mot vung loc: vung ve tay thay cho xa dang chon */
  document.getElementById('loc-xa').value = '';
  if (!dat_vung_loc({ kieu: 've_tay', ten: 'Vùng vẽ tay', hinh_hoc: hinh_hoc })) return;

  ap_dung_loc();
  hien_tom_tat_vung();
}

/* --------------------------------------------------------------------------
   Hop thoai tom tat doi tuong trong vung, gom theo lop
   -------------------------------------------------------------------------- */

/* Danh sach doi tuong trong vung cua tung lop, co tinh ca loc luu vuc va tu
   khoa dang ap dung. Lop dang tat van duoc dem. */
function thong_ke_trong_vung() {
  var ket_qua = [];
  Object.keys(CAU_HINH.lop).forEach(function (ma_lop) {
    var l = LOP[ma_lop];
    if (!l || l.loi || LOP_MIEN_LOC_VUNG[ma_lop] || l.dn.khong_truy_van) return;
    /* Lop tai tre chua duoc bat thi chua co du lieu de dem */
    if (l.chua_tai) return;
    ket_qua.push({
      ma_lop: ma_lop, ten_lop: l.dn.ten, dang_hien: l.hien,
      doi_tuong: l.doi_tuong.filter(qua_bo_loc),
    });
  });
  return ket_qua;
}

function hien_tom_tat_vung() {
  if (!BO_LOC.vung) return;
  var thong_ke = thong_ke_trong_vung();
  var tong = 0;
  thong_ke.forEach(function (m) { tong += m.doi_tuong.length; });

  var html = '<p class="ghi-chu-nho">Các đối tượng có hình học giao với vùng chọn, '
           + 'kể cả đối tượng chỉ nằm một phần trong vùng. Tổng cộng '
           + tong.toLocaleString('vi-VN') + ' đối tượng.</p>';

  if (BO_LOC.ma_luu_vuc || BO_LOC.tu_khoa) {
    html += '<p class="ghi-chu-nho">Đang kết hợp với bộ lọc lưu vực hoặc từ khóa.</p>';
  }

  var chua_tai = Object.keys(LOP).filter(function (ma) { return LOP[ma].chua_tai; })
    .map(function (ma) { return LOP[ma].dn.ten; });
  if (chua_tai.length) {
    html += '<p class="ghi-chu-nho">Chưa tính các lớp nặng chưa được bật: '
          + chua_tai.join(', ') + '. Bật lớp rồi mở lại tóm tắt để tính.</p>';
  }

  html += '<table class="bang-thong-ke"><tbody>';
  thong_ke.forEach(function (m) {
    html += '<tr class="hang-ket-qua" data-lop="' + m.ma_lop + '" style="cursor:pointer">'
          + '<td>' + m.ten_lop + (m.dang_hien ? '' : ' <small>(lớp đang tắt)</small>')
          + '</td><td class="so">' + m.doi_tuong.length.toLocaleString('vi-VN')
          + '</td></tr>';
  });
  html += '</tbody></table>'
        + '<p class="ghi-chu-nho">Nhấp vào một lớp để mở bảng thuộc tính của lớp đó. '
        + 'Nút Xuất CSV và Xuất GeoJSON của bảng cho đầy đủ trường thuộc tính.</p>'
        + '<div class="ct-nut" style="margin-top:14px">'
        + '<button class="nut nut--chinh" id="xuat-tom-tat-vung">'
        + 'Xuất danh sách gộp mọi lớp ra CSV</button></div>';

  mo_hop_thoai('Đối tượng trong vùng', html);
  /* Ten vung lay tu du lieu nen gan bang textContent, khong ghep vao HTML */
  document.getElementById('hop-thoai-ten').textContent =
    'Đối tượng trong vùng: ' + BO_LOC.vung.ten;

  var cac_hang = document.querySelectorAll('#hop-thoai-than .hang-ket-qua');
  for (var i = 0; i < cac_hang.length; i++) {
    cac_hang[i].addEventListener('click', function () {
      dong_hop_thoai();
      mo_bang_theo_lop(this.dataset.lop);
    });
  }

  document.getElementById('xuat-tom-tat-vung')
    .addEventListener('click', function () { xuat_csv_trong_vung(thong_ke); });
}

/* Bat lop neu dang tat, chuyen bang thuoc tinh sang lop do va mo bang */
function mo_bang_theo_lop(ma_lop) {
  var l = LOP[ma_lop];
  if (!l || l.loi) return;

  if (!l.hien) {
    var hop_chon = document.getElementById('chon-' + ma_lop);
    if (hop_chon) hop_chon.checked = true;
    dat_hien_lop(ma_lop, true);
  }

  BANG.ma_lop = ma_lop;
  BANG.cot_sap_xep = null;
  document.getElementById('bang-chon-lop').value = ma_lop;
  ve_lai_bang();

  var khu = document.getElementById('khu-bang');
  if (!khu.classList.contains('mo')) {
    khu.classList.add('mo');
    document.getElementById('mo-bang').setAttribute('aria-expanded', 'true');
    setTimeout(function () { ban_do.invalidateSize(); }, 220);
  }
}

function xuat_csv_trong_vung(thong_ke) {
  var ten_vung = BO_LOC.vung ? BO_LOC.vung.ten : '';
  var cot = ['Lớp', 'Mã', 'Tên', 'Kinh độ', 'Vĩ độ', 'Vùng chọn'];
  var hang = [];

  thong_ke.forEach(function (m) {
    var dn = LOP[m.ma_lop].dn;
    m.doi_tuong.forEach(function (dt) {
      var tam = tam_hinh_hoc(dt.hinh_hoc);
      hang.push([
        m.ten_lop,
        dt.thuoc_tinh[dn.khoa] || '',
        nhan_doi_tuong(m.ma_lop, dt.thuoc_tinh),
        tam ? tam.lng.toFixed(6) : '',
        tam ? tam.lat.toFixed(6) : '',
        ten_vung,
      ]);
    });
  });

  tai_ve_csv('doi_tuong_trong_vung.csv', cot, hang);
}
