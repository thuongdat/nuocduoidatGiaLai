/* ==========================================================================
   config_ndd.js - Bo lop cua trang Tai nguyen nuoc duoi dat
   --------------------------------------------------------------------------
   CHI trang pages/nuoc-duoi-dat.html nap tep nay, ngay SAU config.js.

   Trang do dung lai nguyen bo may cua trang ban do (map.js, layers.js,
   identify.js, loc_khong_gian.js, table.js, app.js). Bo may chi doc
   CAU_HINH.lop va CAU_HINH.nhom_lop, nen tep nay THAY hai khoi do bang bo lop
   nuoc duoi dat la du; khong tep nao khac phai biet dang o trang nao.

   Du lieu: data/ndd/*.geojson, sinh boi scripts/09_chuan_hoa_ndd.py tu
   CSDL/TN_NDD_GeoJSON_WGS84. TEN TRUONG GIU THEO NGUON (maCongTrinh,
   kyHieuTCN...), khac voi quy uoc ten truong cua cac lop nuoc mat.

   Mau lay tu cac tep .qml di kem bo du lieu. Mau vung cua tang chua nuoc va
   tru luong la mau quy uoc cua ban do dia chat thuy van (xanh lo: lo hong,
   xanh luc: khe nut, hong: khong chua nuoc) nen rat nhat; dung do mo cao va
   vien tim cua .qml de van doc duoc tren nen sang.

   Co tai_tre: true nghia la lop KHONG tai luc mo trang, chi tai khi nguoi
   dung bat. Dung cho ba lop vung nang khoang 5 MB moi lop; xem
   dat_hien_lop() trong layers.js.
   ========================================================================== */

/* Mau vien dung chung, lay tu .qml */
var MAU_NDD = {
  vien_tcn: '#a850ff',     /* vien tang chua nuoc va tru luong */
  vien_cln: '#ec35bc',     /* vien phan vung khoang hoa */
  diem: '#030cb4',         /* gieng, lo khoan */
};

/* Ky hieu tang chua nuoc -> mau nen va dien giai, theo TangChuaNuoc.qml */
var TANG_CHUA_NUOC = [
  { ma: 'qh', mau: '#d2ffff', nhan: 'qh - Lỗ hổng trong trầm tích Holocen' },
  { ma: 'qp', mau: '#d2ffff', nhan: 'qp - Lỗ hổng trong trầm tích Pleistocen' },
  { ma: 'β(n2-qp)', mau: '#d0ffd0',
    nhan: 'β(n2-qp) - Khe nứt, lỗ hổng trong bazan Pliocen - Pleistocen' },
  { ma: 'n1-2', mau: '#d0ffd0',
    nhan: 'n1-2 - Khe nứt, lỗ hổng trong trầm tích Miocen - Pliocen' },
  { ma: 'k', mau: '#e5fff2', nhan: 'k - Khe nứt trong trầm tích lục nguyên Kreta' },
  { ma: 'ε-o', mau: '#daffda',
    nhan: 'ε-o - Khe nứt trong đá biến chất Cambri - Ordovic' },
  { ma: 'pr', mau: '#daffda', nhan: 'pr - Khe nứt trong đá biến chất Proterozoi' },
  { ma: 'kcn', mau: '#ffe3da',
    nhan: 'Thành tạo rất nghèo nước hoặc không chứa nước' },
];

/* Tru luong: .qml to mau theo cap (tang chua nuoc, phan cap tru luong) */
var TRU_LUONG = [
  { tcn: 'qh', cap: 'Giàu', mau: '#c7ffff' },
  { tcn: 'qh', cap: 'Trung bình', mau: '#d6ffff' },
  { tcn: 'qp', cap: 'Rất giàu', mau: '#c7ffff' },
  { tcn: 'qp', cap: 'Giàu', mau: '#c7ffff' },
  { tcn: 'qp', cap: 'Trung bình', mau: '#d0ffff' },
  { tcn: 'qp', cap: 'Nghèo', mau: '#e5ffff' },
  { tcn: 'β(n2-qp)', cap: 'Trung bình', mau: '#daffda' },
  { tcn: 'n1-2', cap: 'Giàu', mau: '#d0ffd0' },
  { tcn: 'k', cap: 'Rất nghèo', mau: '#e5fff2' },
  { tcn: 'ε-o', cap: 'Rất giàu', mau: '#d0ffd0' },
  { tcn: 'pr', cap: 'Rất giàu', mau: '#d0ffd0' },
  { tcn: 'pr', cap: 'Trung bình', mau: '#d0ffe8' },
];

/* Chat luong: phan cap tong khoang hoa M theo can tren mDen (g/l).
   Dung mDen chu khong dung phanCapM, vi phanCapM o nguon ghi khong thong
   nhat ("M < 1,0 g/l", "M<1 (g/l)", "M< 1(g/l)"...). */
var KHOANG_HOA = [
  { den: 1.0, mau: '#ffff9c', nhan: 'M < 1,0 g/l' },
  { den: 1.5, mau: '#ffd2a0', nhan: 'M 1,0 - 1,5 g/l' },
  { den: 3.0, mau: '#ffb464', nhan: 'M 1,5 - 3,0 g/l' },
  { den: 10.0, mau: '#ff6eff', nhan: 'M 3,0 - 10,0 g/l' },
];
var MAU_KHONG_CHUA_NUOC = '#ffe3da';
var MAU_CHUA_PHAN_CAP = '#ffb4ff';

var VUNG_HAN_CHE = [
  { ma: 'Vùng hạn chế 1', mau: '#e60000' },
  { ma: 'Vùng hạn chế 3', mau: '#ff8c00' },
  { ma: 'Vùng hạn chế hỗn hợp', mau: '#9600c8' },
];

var LOAI_TRAM_NDD = [
  { ma: 'QTQG_NDD', hinh: 'tron', mau: '#030cb4',
    nhan: 'Lỗ khoan quan trắc nước dưới đất' },
  { ma: 'TV_QuocGia', hinh: 'tam_giac', mau: '#ff0000', nhan: 'Trạm thủy văn' },
  { ma: 'Do_3ThgKiet', hinh: 'vuong', mau: '#33a02c',
    nhan: 'Điểm đo lưu lượng 3 tháng kiệt' },
];

/* Tim mot dong trong bang tra theo gia tri cua mot truong */
function tra_bang_ndd(bang, truong, gia_tri) {
  for (var i = 0; i < bang.length; i++) {
    if (bang[i][truong] === gia_tri) return bang[i];
  }
  return null;
}

/* Kieu ve chung cho lop vung */
function kieu_vung_ndd(mau_nen, mau_vien, do_mo) {
  return { color: mau_vien, weight: 1.2, opacity: 0.9,
           fillColor: mau_nen, fillOpacity: do_mo };
}

/* Truong hanh chinh lap lai o cac lop diem */
var TRUONG_HANH_CHINH_NDD = [
  { ma: 'tenXa', ten: 'Xã, phường' },
  { ma: 'thon', ten: 'Thôn, tổ dân phố' },
  { ma: 'xaCu', ten: 'Xã cũ' },
  { ma: 'huyenCu', ten: 'Huyện cũ' },
];

(function () {
  /* Ba lop dung lai nguyen khai bao cua trang ban do */
  var ranh_gioi_tinh = CAU_HINH.lop.ranh_gioi_tinh;
  var ranh_gioi_xa = CAU_HINH.lop.ranh_gioi_xa;
  var quan_trac_ndd = CAU_HINH.lop.quan_trac_ndd;
  /* Mac dinh tat o trang nay: 13 lo khoan QT*-BD cua lop nay trung voi lop
     ndd_tram_quan_trac. */
  quan_trac_ndd.hien = false;

  /* Du lieu nuoc duoi dat hien chi phu phan Binh Dinh cu, nen mo ban do o
     dung vung do thay vi toan tinh. Dang [[vi nam, kinh tay], [vi bac, kinh dong]]. */
  CAU_HINH.pham_vi_trang = [[13.52, 108.60], [14.70, 109.37]];
  /* Bang thuoc tinh mo dau bang lop gieng khoan */
  CAU_HINH.lop_bang_mac_dinh = 'ndd_gieng_khoan';
  /* Dai ghi chu dau trang doc truong nay trong tinh.json */
  CAU_HINH.truong_ghi_chu_dau_trang = 'ghi_chu_dau_trang_ndd';

  CAU_HINH.nhom_lop = [
    { ma: 'hanh_chinh', ten: 'Nền và hành chính', mo: true,
      lop: ['ranh_gioi_tinh', 'ranh_gioi_xa'] },
    { ma: 'ndd_tang', ten: 'Tầng chứa nước', mo: true,
      lop: ['ndd_tang_chua_nuoc'] },
    { ma: 'ndd_danh_gia', ten: 'Điều tra, đánh giá', mo: true,
      lop: ['ndd_tru_luong', 'ndd_chat_luong', 'ndd_nhiem_man', 'ndd_o_nhiem'] },
    { ma: 'ndd_quan_ly', ten: 'Quản lý, bảo vệ', mo: true,
      lop: ['ndd_vung_han_che', 'ndd_luu_vuc'] },
    { ma: 'ndd_khai_thac', ten: 'Khai thác nước dưới đất', mo: true,
      lop: ['ndd_gieng_khoan', 'ndd_gieng_dao'] },
    { ma: 'ndd_quan_trac', ten: 'Điều tra và quan trắc', mo: true,
      lop: ['ndd_lo_khoan_dia_tang', 'ndd_tram_quan_trac', 'quan_trac_ndd'] },
  ];

  CAU_HINH.lop = {

    ranh_gioi_tinh: ranh_gioi_tinh,
    ranh_gioi_xa: ranh_gioi_xa,

    /* ===== Tang chua nuoc ===== */
    ndd_tang_chua_nuoc: {
      ten: 'Tầng chứa nước',
      tep: 'ndd/tang_chua_nuoc.geojson',
      kieu: 'vung',
      hien: false,
      tai_tre: true,
      z: 400,
      khoa: 'ma',
      truong_nhan: 'tenTangChuaNuoc',
      mo_ta: 'Phạm vi phân bố các tầng chứa nước và thành tạo không chứa nước',
      kieu_ve: function (p) {
        var d = tra_bang_ndd(TANG_CHUA_NUOC, 'ma', p.kyHieuTCN);
        return kieu_vung_ndd(d ? d.mau : '#eeeeee', MAU_NDD.vien_tcn, 0.75);
      },
      truong: [
        { ma: 'tenTangChuaNuoc', ten: 'Tên tầng chứa nước' },
        { ma: 'kyHieuTCN', ten: 'Ký hiệu' },
        { ma: 'maTangChuaNuoc', ten: 'Mã tầng chứa nước' },
        { ma: 'maNguonNDD', ten: 'Mã nguồn nước dưới đất' },
        { ma: 'moTaPhanBo', ten: 'Mô tả phân bố' },
        { ma: 'dienTichPhanBo', ten: 'Diện tích phân bố', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'dtLo', ten: 'Diện tích lộ', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'dtBiPhu', ten: 'Diện tích bị phủ', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'chieuSauPhanBoTu', ten: 'Chiều sâu phân bố từ', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'chieuSauPhanBoDen', ten: 'Chiều sâu phân bố đến', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'beDayTB', ten: 'Bề dày trung bình', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'mnTinhTB', ten: 'Mực nước tĩnh trung bình', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'qTB', ten: 'Lưu lượng trung bình', dinh_dang: 'so_le', don_vi: 'l/s' },
        { ma: 'tyLLTB', ten: 'Tỷ lưu lượng trung bình', dinh_dang: 'so_le', don_vi: 'l/s.m' },
        { ma: 'tdsTB', ten: 'Tổng khoáng hóa trung bình', dinh_dang: 'so_le', don_vi: 'g/l' },
        { ma: 'heSoTham', ten: 'Hệ số thấm', dinh_dang: 'so_le', don_vi: 'm/ngày' },
        { ma: 'heSoDanNuoc', ten: 'Hệ số dẫn nước', dinh_dang: 'so_le', don_vi: 'm²/ngày' },
        { ma: 'heSoNhaNuoc', ten: 'Hệ số nhả nước', dinh_dang: 'vi_luong' },
        { ma: 'hsNhaDH', ten: 'Hệ số nhả nước đàn hồi', dinh_dang: 'vi_luong' },
      ],
      cot_bang: ['ma', 'kyHieuTCN', 'tenTangChuaNuoc', 'dienTichPhanBo',
                 'beDayTB', 'mnTinhTB', 'tdsTB'],
      chu_giai: TANG_CHUA_NUOC.map(function (d) {
        return { kieu: 'vung', mau: d.mau, nhan: d.nhan };
      }),
    },

    /* ===== Tru luong ===== */
    ndd_tru_luong: {
      ten: 'Trữ lượng nước dưới đất',
      tep: 'ndd/tru_luong.geojson',
      kieu: 'vung',
      hien: false,
      tai_tre: true,
      z: 401,
      khoa: 'maDoiTuong',
      truong_nhan: 'phanCapTL',
      mo_ta: 'Phân cấp trữ lượng khai thác theo tầng chứa nước',
      kieu_ve: function (p) {
        var mau = '#eeeeee';
        if (p.kyHieuTCN === 'kcn') {
          mau = MAU_KHONG_CHUA_NUOC;
        } else {
          for (var i = 0; i < TRU_LUONG.length; i++) {
            if (TRU_LUONG[i].tcn === p.kyHieuTCN && TRU_LUONG[i].cap === p.phanCapTL) {
              mau = TRU_LUONG[i].mau;
            }
          }
        }
        return kieu_vung_ndd(mau, MAU_NDD.vien_tcn, 0.75);
      },
      truong: [
        { ma: 'kyHieuTCN', ten: 'Tầng chứa nước' },
        { ma: 'phanCapTL', ten: 'Phân cấp trữ lượng' },
        { ma: 'truLuongKT', ten: 'Trữ lượng khai thác', dinh_dang: 'so', don_vi: 'm³/ngày' },
        { ma: 'dienTich', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'biPhu', ten: 'Bị phủ (1 là có)' },
        { ma: 'maNguonNDD', ten: 'Mã nguồn nước dưới đất' },
        { ma: 'maDA', ten: 'Mã dự án' },
        { ma: 'lopNguon', ten: 'Lớp nguồn' },
      ],
      cot_bang: ['kyHieuTCN', 'phanCapTL', 'truLuongKT', 'dienTich', 'maNguonNDD'],
      chu_giai: TRU_LUONG.map(function (d) {
        return { kieu: 'vung', mau: d.mau, nhan: d.tcn + ' - ' + d.cap };
      }).concat([{ kieu: 'vung', mau: MAU_KHONG_CHUA_NUOC, nhan: 'Không chứa nước' }]),
    },

    /* ===== Chat luong: phan vung tong khoang hoa ===== */
    ndd_chat_luong: {
      ten: 'Chất lượng (tổng khoáng hóa)',
      tep: 'ndd/chat_luong.geojson',
      kieu: 'vung',
      hien: false,
      tai_tre: true,
      z: 402,
      khoa: 'maDoiTuong',
      truong_nhan: 'phanCapM',
      mo_ta: 'Phân vùng tổng khoáng hóa M của nước dưới đất theo tầng chứa nước',
      kieu_ve: function (p) {
        var mau = MAU_CHUA_PHAN_CAP;
        var vien = '#232323';
        if (p.kyHieuTCN === 'kcn') {
          mau = MAU_KHONG_CHUA_NUOC;
        } else {
          var d = tra_bang_ndd(KHOANG_HOA, 'den', p.mDen);
          if (d) { mau = d.mau; vien = MAU_NDD.vien_cln; }
        }
        return kieu_vung_ndd(mau, vien, 0.7);
      },
      truong: [
        { ma: 'kyHieuTCN', ten: 'Tầng chứa nước' },
        { ma: 'phanCapM', ten: 'Phân cấp khoáng hóa' },
        { ma: 'cln_thong_so', ten: 'Thông số' },
        { ma: 'mTu', ten: 'Từ', dinh_dang: 'so_le', don_vi: 'g/l' },
        { ma: 'mDen', ten: 'Đến', dinh_dang: 'so_le', don_vi: 'g/l' },
        { ma: 'dienTich', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'maNguonNDD', ten: 'Mã nguồn nước dưới đất' },
        { ma: 'maDA', ten: 'Mã dự án' },
        { ma: 'lopNguon', ten: 'Lớp nguồn' },
      ],
      cot_bang: ['kyHieuTCN', 'phanCapM', 'mTu', 'mDen', 'dienTich'],
      chu_giai: KHOANG_HOA.map(function (d) {
        return { kieu: 'vung', mau: d.mau, nhan: d.nhan };
      }).concat([
        { kieu: 'vung', mau: MAU_CHUA_PHAN_CAP, nhan: 'Chưa phân cấp khoáng hóa' },
        { kieu: 'vung', mau: MAU_KHONG_CHUA_NUOC, nhan: 'Không chứa nước' },
      ]),
    },

    /* ===== Nhiem man ===== */
    ndd_nhiem_man: {
      ten: 'Vùng nhiễm mặn',
      tep: 'ndd/nhiem_man.geojson',
      kieu: 'vung',
      hien: false,
      z: 412,
      khoa: 'maDoiTuong',
      truong_nhan: 'mucDoNhiemMan',
      mo_ta: 'Ranh giới các vùng nước dưới đất bị nhiễm mặn',
      kieu_ve: function () {
        return { color: '#ff7f00', weight: 1.8, opacity: 0.95,
                 fillColor: '#ff7f00', fillOpacity: 0.12 };
      },
      truong: [
        { ma: 'mucDoNhiemMan', ten: 'Mức độ nhiễm mặn' },
        { ma: 'kyHieuTCN', ten: 'Tầng chứa nước' },
        { ma: 'dienTich', ten: 'Diện tích', dinh_dang: 'vi_luong', don_vi: 'km²' },
        { ma: 'maNguonNDD', ten: 'Mã nguồn nước dưới đất' },
        { ma: 'maDA', ten: 'Mã dự án' },
        { ma: 'lopNguon', ten: 'Lớp nguồn' },
      ],
      cot_bang: ['mucDoNhiemMan', 'kyHieuTCN', 'dienTich', 'lopNguon'],
      chu_giai: [{ kieu: 'vung', mau: '#ff7f00', nhan: 'Nhiễm mặn (M > 1,5 g/l)' }],
    },

    /* ===== O nhiem ===== */
    ndd_o_nhiem: {
      ten: 'Vùng ô nhiễm',
      tep: 'ndd/o_nhiem.geojson',
      kieu: 'vung',
      hien: false,
      z: 414,
      khoa: 'maDoiTuong',
      truong_nhan: 'mucDoONhiem',
      mo_ta: 'Các vùng nước dưới đất có thông số vượt ngưỡng',
      kieu_ve: function () {
        return { color: '#f78f06', weight: 1.4, opacity: 0.95,
                 fillColor: '#f78f06', fillOpacity: 0.3, dashArray: '4 3' };
      },
      truong: [
        { ma: 'mucDoONhiem', ten: 'Mức độ ô nhiễm' },
        { ma: 'kyHieuTCN', ten: 'Tầng chứa nước' },
        { ma: 'dienTich', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'maNguonNDD', ten: 'Mã nguồn nước dưới đất' },
        { ma: 'maDA', ten: 'Mã dự án' },
        { ma: 'lopNguon', ten: 'Lớp nguồn' },
      ],
      cot_bang: ['mucDoONhiem', 'kyHieuTCN', 'dienTich', 'lopNguon'],
      chu_giai: [{ kieu: 'vung', mau: '#f78f06',
                   nhan: 'Vùng ô nhiễm (Coliform, NO3, Mangan vượt ngưỡng)' }],
    },

    /* ===== Vung han che khai thac ===== */
    ndd_vung_han_che: {
      ten: 'Vùng hạn chế khai thác',
      tep: 'ndd/vung_han_che.geojson',
      kieu: 'vung',
      hien: true,
      z: 416,
      khoa: 'maDoiTuong',
      truong_nhan: 'tenVungHanChe',
      mo_ta: 'Vùng hạn chế khai thác nước dưới đất',
      kieu_ve: function (p) {
        var d = tra_bang_ndd(VUNG_HAN_CHE, 'ma', p.loaiVung);
        var mau = d ? d.mau : MAU.trung_tinh;
        return { color: mau, weight: 1.2, opacity: 0.9,
                 fillColor: mau, fillOpacity: 0.25 };
      },
      truong: [
        { ma: 'tenVungHanChe', ten: 'Tên vùng hạn chế' },
        { ma: 'loaiVung', ten: 'Loại vùng' },
        { ma: 'dienTichVungHC', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'dsTenXa', ten: 'Các xã, phường' },
      ],
      cot_bang: ['tenVungHanChe', 'loaiVung', 'dienTichVungHC', 'dsTenXa'],
      chu_giai: VUNG_HAN_CHE.map(function (d) {
        return { kieu: 'vung', mau: d.mau, nhan: d.ma };
      }),
    },

    /* ===== Luu vuc song (pham vi dieu tra nuoc duoi dat) ===== */
    ndd_luu_vuc: {
      ten: 'Lưu vực sông',
      tep: 'ndd/luu_vuc.geojson',
      kieu: 'vung',
      hien: false,
      z: 410,
      khoa: 'maLuuVucSong',
      truong_nhan: 'tenLuuVucSong',
      mo_ta: 'Các lưu vực sông dùng làm đơn vị điều tra, đánh giá nước dưới đất',
      kieu_ve: function () {
        return { color: '#005ac8', weight: 2, opacity: 0.9,
                 fillColor: '#005ac8', fillOpacity: 0.03 };
      },
      truong: [
        { ma: 'tenLuuVucSong', ten: 'Tên lưu vực' },
        { ma: 'loaiLuuVucSong', ten: 'Loại lưu vực' },
        { ma: 'maLVSLon', ten: 'Thuộc lưu vực lớn' },
        { ma: 'dienTichLuuVuc', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
      ],
      cot_bang: ['maLuuVucSong', 'tenLuuVucSong', 'loaiLuuVucSong',
                 'maLVSLon', 'dienTichLuuVuc'],
      chu_giai: [{ kieu: 'duong', mau: '#005ac8', nhan: 'Ranh giới lưu vực sông' }],
    },

    /* ===== Cong trinh khai thac: gieng khoan ===== */
    ndd_gieng_khoan: {
      ten: 'Giếng khoan khai thác',
      tep: 'ndd/gieng_khoan.geojson',
      kieu: 'diem',
      ky_hieu: { hinh: 'tron' },
      hien: true,
      z: 460,
      khoa: 'maCongTrinh',
      truong_nhan: 'tenCongTrinh',
      mo_ta: 'Công trình khai thác nước dưới đất bằng giếng khoan',
      /* Mau theo tinh trang giay phep. 163 cong trinh khong co thong tin giay
         phep (nguon ke thua, dieu tra) nen co mau rieng, khong coi la het han. */
      kieu_ve: function (p) {
        var mau = MAU.trung_tinh;
        if (p.ttGiayPhep === 'Còn hạn') mau = '#0f766e';
        else if (p.ttGiayPhep === 'Hết hạn') mau = MAU.xau;
        /* Co theo luu luong khai thac, thang log */
        var q = p.luuLuongKhaiThac || 10;
        var bk = Math.max(3.5, Math.min(8, 2.2 + Math.log10(q) * 1.4));
        return { radius: bk, fillColor: mau, color: '#ffffff', weight: 1.2,
                 opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'tenCongTrinh', ten: 'Tên công trình' },
        { ma: 'soHieuGiengKhoan', ten: 'Số hiệu giếng khoan' },
        { ma: 'loaiCTGoc', ten: 'Loại công trình' },
        { ma: 'toChucCaNhan', ten: 'Tổ chức, cá nhân' },
        { ma: 'mucDichKhaiThac', ten: 'Mục đích khai thác' },
        { ma: 'soGiayPhep', ten: 'Số giấy phép' },
        { ma: 'ttGiayPhep', ten: 'Tình trạng giấy phép' },
        { ma: 'luuLuongKhaiThac', ten: 'Lưu lượng khai thác', dinh_dang: 'so_le', don_vi: 'm³/ngày' },
        { ma: 'soGiengKhaiThac', ten: 'Số giếng khai thác', dinh_dang: 'so' },
        { ma: 'chieuSauGiengKhoan', ten: 'Chiều sâu giếng', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'mnTinh', ten: 'Mực nước tĩnh', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'haThap', ten: 'Hạ thấp mực nước', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'tenTangChuaNuoc', ten: 'Tầng chứa nước' },
        { ma: 'kyHieuTCN', ten: 'Ký hiệu tầng chứa nước' },
        { ma: 'tenLVS', ten: 'Lưu vực sông' },
      ].concat(TRUONG_HANH_CHINH_NDD, [
        { ma: 'nguonTL', ten: 'Nguồn tài liệu' },
        { ma: 'ghiChu', ten: 'Ghi chú' },
      ]),
      cot_bang: ['maCongTrinh', 'tenCongTrinh', 'toChucCaNhan', 'luuLuongKhaiThac',
                 'chieuSauGiengKhoan', 'kyHieuTCN', 'ttGiayPhep', 'tenXa'],
      chu_giai: [
        { kieu: 'diem', mau: '#0f766e', nhan: 'Giấy phép còn hạn (259)' },
        { kieu: 'diem', mau: MAU.xau, nhan: 'Giấy phép hết hạn (69)' },
        { kieu: 'diem', mau: MAU.trung_tinh, nhan: 'Không có thông tin giấy phép (163)' },
      ],
    },

    /* ===== Cong trinh khai thac: gieng dao ===== */
    ndd_gieng_dao: {
      ten: 'Giếng đào khai thác',
      tep: 'ndd/gieng_dao.geojson',
      kieu: 'diem',
      ky_hieu: { hinh: 'vuong' },
      hien: true,
      z: 465,
      khoa: 'maCongTrinh',
      truong_nhan: 'tenCongTrinh',
      mo_ta: 'Công trình khai thác nước dưới đất bằng giếng đào',
      kieu_ve: function () {
        return { radius: 6.5, fillColor: MAU_NDD.diem, color: '#ffffff',
                 weight: 1.4, opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'tenCongTrinh', ten: 'Tên công trình' },
        { ma: 'loaiCTGoc', ten: 'Loại công trình' },
        { ma: 'mucDichKhaiThac', ten: 'Mục đích khai thác' },
        { ma: 'luuLuongKhaiThac', ten: 'Lưu lượng khai thác', dinh_dang: 'so_le', don_vi: 'm³/ngày' },
        { ma: 'chieuSauGiengDao', ten: 'Chiều sâu giếng', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'mnTinh', ten: 'Mực nước tĩnh', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'haThap', ten: 'Hạ thấp mực nước', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'tenTangChuaNuoc', ten: 'Tầng chứa nước' },
        { ma: 'kyHieuTCN', ten: 'Ký hiệu tầng chứa nước' },
        { ma: 'tenLVS', ten: 'Lưu vực sông' },
      ].concat(TRUONG_HANH_CHINH_NDD, [
        { ma: 'nguonTL', ten: 'Nguồn tài liệu' },
      ]),
      cot_bang: ['maCongTrinh', 'tenCongTrinh', 'luuLuongKhaiThac',
                 'chieuSauGiengDao', 'kyHieuTCN', 'tenXa'],
      chu_giai: [{ kieu: 'diem', mau: MAU_NDD.diem, nhan: 'Giếng đào khai thác' }],
    },

    /* ===== Lo khoan dia tang ===== */
    ndd_lo_khoan_dia_tang: {
      ten: 'Lỗ khoan địa tầng',
      tep: 'ndd/lo_khoan_dia_tang.geojson',
      kieu: 'diem',
      ky_hieu: { hinh: 'thoi' },
      hien: true,
      z: 455,
      khoa: 'maLoKhoan',
      truong_nhan: 'tenDiem',
      mo_ta: 'Lỗ khoan, giếng điều tra có thông tin địa tầng và thông số tầng chứa nước',
      kieu_ve: function () {
        return { radius: 5.5, fillColor: '#7c3aed', color: '#ffffff',
                 weight: 1.2, opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'tenDiem', ten: 'Tên điểm' },
        { ma: 'loaiCT', ten: 'Loại công trình (GK giếng khoan, GD giếng đào)' },
        { ma: 'kyHieuTCN', ten: 'Tầng chứa nước' },
        { ma: 'maTCN', ten: 'Mã tầng chứa nước' },
        { ma: 'doSauKhoan', ten: 'Độ sâu khoan', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'csMai', ten: 'Chiều sâu mái tầng', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'csDay', ten: 'Chiều sâu đáy tầng', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'dayTCN', ten: 'Bề dày tầng chứa nước', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'mnTinh', ten: 'Mực nước tĩnh', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'luuLuong', ten: 'Lưu lượng', dinh_dang: 'so_le', don_vi: 'l/s' },
        { ma: 'haThap', ten: 'Hạ thấp mực nước', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'tyLuuLuong', ten: 'Tỷ lưu lượng', dinh_dang: 'so_le', don_vi: 'l/s.m' },
        { ma: 'tds', ten: 'Tổng khoáng hóa', dinh_dang: 'so_le', don_vi: 'g/l' },
        { ma: 'heSoTham', ten: 'Hệ số thấm', dinh_dang: 'so_le', don_vi: 'm/ngày' },
        { ma: 'loaiHinhHH', ten: 'Loại hình hóa học' },
        { ma: 'tenXa', ten: 'Xã, phường' },
        { ma: 'lopNguon', ten: 'Lớp nguồn' },
      ],
      cot_bang: ['maLoKhoan', 'loaiCT', 'kyHieuTCN', 'doSauKhoan', 'dayTCN',
                 'luuLuong', 'tds', 'tenXa'],
      chu_giai: [{ kieu: 'diem', mau: '#7c3aed', nhan: 'Lỗ khoan địa tầng' }],
    },

    /* ===== Tram, diem quan trac ===== */
    ndd_tram_quan_trac: {
      ten: 'Trạm, điểm quan trắc',
      tep: 'ndd/tram_quan_trac.geojson',
      kieu: 'diem',
      /* Hinh theo loai tram. Vi ky_hieu la ham, moi dong chu_giai phai tu khai
         ky_hieu, neu khong ca bang chu giai ra cung mot hinh. */
      ky_hieu: function (p) {
        var d = tra_bang_ndd(LOAI_TRAM_NDD, 'ma', p && p.loaiTram);
        return { hinh: d ? d.hinh : 'tron' };
      },
      hien: true,
      z: 470,
      khoa: 'maTram',
      truong_nhan: 'tenTram',
      mo_ta: 'Lỗ khoan quan trắc nước dưới đất, trạm thủy văn và điểm đo lưu lượng mùa kiệt',
      kieu_ve: function (p) {
        var d = tra_bang_ndd(LOAI_TRAM_NDD, 'ma', p.loaiTram);
        return { radius: 7, fillColor: d ? d.mau : MAU.trung_tinh,
                 color: '#ffffff', weight: 1.5, opacity: 1, fillOpacity: 0.95 };
      },
      truong: [
        { ma: 'tenTram', ten: 'Tên trạm' },
        { ma: 'loaiTram', ten: 'Loại trạm' },
        { ma: 'loaiNguonNuoc', ten: 'Loại nguồn nước (TCN tầng chứa nước, SS sông suối)' },
        { ma: 'yeuToQuanTrac', ten: 'Yếu tố quan trắc (H mực nước, Q lưu lượng)' },
        { ma: 'kyHieuTCN', ten: 'Tầng chứa nước' },
        { ma: 'maNguonNuoc', ten: 'Mã nguồn nước' },
        { ma: 'chieuSau', ten: 'Chiều sâu', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'hMax', ten: 'Mực nước lớn nhất', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'hMin', ten: 'Mực nước nhỏ nhất', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'hTB', ten: 'Mực nước trung bình', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'pH', ten: 'pH', dinh_dang: 'so_le' },
        { ma: 'tds', ten: 'Tổng khoáng hóa', dinh_dang: 'so_le', don_vi: 'mg/l' },
        { ma: 'qMax', ten: 'Lưu lượng lớn nhất', dinh_dang: 'so_le' },
        { ma: 'qMin', ten: 'Lưu lượng nhỏ nhất', dinh_dang: 'so_le' },
        { ma: 'qTB', ten: 'Lưu lượng trung bình', dinh_dang: 'so_le' },
        { ma: 'dtLuuVuc', ten: 'Diện tích lưu vực', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'tenXa', ten: 'Xã, phường' },
      ],
      cot_bang: ['maTram', 'loaiTram', 'yeuToQuanTrac', 'kyHieuTCN', 'hTB',
                 'qTB', 'tenXa'],
      chu_giai: LOAI_TRAM_NDD.map(function (d) {
        return { kieu: 'diem', ky_hieu: { hinh: d.hinh }, mau: d.mau, nhan: d.nhan };
      }),
    },

    quan_trac_ndd: quan_trac_ndd,
  };
})();
