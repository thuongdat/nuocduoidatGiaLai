/* ==========================================================================
   config.js - Cau hinh trung tam cua he thong
   --------------------------------------------------------------------------
   Day la noi duy nhat can sua khi them lop du lieu moi hoac doi ky hieu.
   Moi lop khai bao: ten, ten tep, kieu hinh hoc, ky hieu, danh sach truong
   thuoc tinh va chu giai. Cac tep JS khac chi doc cau hinh nay.

   Tep nay dung CHUNG cho moi tinh. Nhung gi khac nhau giua cac tinh, nhu ten
   tinh, pham vi ban do hay danh sach lop co san, nam trong tinh/<ma>.json.
   Truong "tep" chi ghi ten tep; duong dan day du do ham duong_dan_du_lieu()
   trong tinh.js ghep lai thanh data/<ma_tinh>/<ten tep>.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Bang mau trang thai, dung chung cho toan he thong
   -------------------------------------------------------------------------- */
const MAU = {
  tot:      '#16a34a',   // con kha nang / binh thuong
  theo_doi: '#f59e0b',   // gan nguong / can theo doi
  xau:      '#dc2626',   // vuot nguong / canh bao
  tran:     '#7c3aed',   // ho gan tran
  trung_tinh: '#64748b',
  song:     '#1572a1',
  mat_nuoc: '#4cadd4',
  luu_vuc:  '#3d8fa8',
};

/* --------------------------------------------------------------------------
   Ham dinh dang gia tri hien thi
   -------------------------------------------------------------------------- */
const DINH_DANG = {
  chu: function (v) {
    return (v === null || v === undefined || v === '') ? null : String(v);
  },

  so: function (v) {
    if (v === null || v === undefined || v === '') return null;
    return Number(v).toLocaleString('vi-VN');
  },

  so_le: function (v) {
    if (v === null || v === undefined || v === '') return null;
    return Number(v).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  },

  /* Thong so vi luong nhu kim loai nang co nong do co 0,0001 mg/L. Dung
     so_le (toi da 2 chu so thap phan) thi chung hien thanh 0, nghia la bao sai
     ket qua quan trac. Giu toi 5 chu so thap phan nhung bo so 0 du phia sau,
     nen 0,5 van hien la 0,5 chu khong phai 0,50000. */
  vi_luong: function (v) {
    if (v === null || v === undefined || v === '') return null;
    return Number(v).toLocaleString('vi-VN', { maximumFractionDigits: 5 });
  },

  phan_tram: function (v) {
    if (v === null || v === undefined || v === '') return null;
    return (Number(v) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%';
  },

  ngay: function (v) {
    if (!v) return null;
    var d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('vi-VN');
  },

  /* Moc thoi gian cua mot so do, co the co gio hoac chi co ngay.
     Giao cho dinh_dang_thoi_diem() trong dung_chung.js vi ham do da xu ly
     truong hop chuoi chi co ngay (dung new Date() se bay ra "07:00" khong co
     that) va truong hop ky quan trac ghi bang chu nhu "Nam 2025". Co kiem tra
     ton tai de config.js khong phu thuoc thu tu nap. */
  thoi_diem: function (v) {
    if (!v) return null;
    if (typeof dinh_dang_thoi_diem === 'function') {
      return dinh_dang_thoi_diem(v);
    }
    return String(v);
  },
};

/* Dinh dang mot gia tri theo khai bao truong, co kem don vi */
function dinh_dang_gia_tri(truong, gia_tri) {
  var ham = DINH_DANG[truong.dinh_dang || 'chu'] || DINH_DANG.chu;
  var ket_qua = ham(gia_tri);
  if (ket_qua === null) return null;
  return truong.don_vi ? ket_qua + ' ' + truong.don_vi : ket_qua;
}

/* Do day net ve theo cap song, dung trong kieu_ve cua lop song_suoi */
const DAY_NET_SONG = {
  'Sông chính': 4.6,
  'Cấp I': 3.4,
  'Cấp II': 2.4,
  'Cấp III': 1.6,
  'Cấp IV': 1.2,
  'Phụ lưu': 1.2,
};

/* --------------------------------------------------------------------------
   Cau hinh chinh
   -------------------------------------------------------------------------- */
const CAU_HINH = {

  he_thong: {
    /* Ten tinh, don vi chu quan va pham vi ban do nay nam trong tinh/<ma>.json
       va duoc truy cap qua bien toan cuc TINH. Khong dat o day nua vi moi tinh
       mot khac, trong khi tep config.js thi dung chung cho moi tinh. */
    phien_ban: '1.0.0',
    /* Chu ky lam moi du lieu quan trac, don vi phut */
    chu_ky_lam_moi_phut: 10,
  },

  /* ---------------- Backend trung gian quan trac QTQG ----------------
     Chi trang pages/quan-trac.html dung khoi nay. Trang ban do van doc
     data/realtime.json nhu cu.
     Doi dia chi dich vu khi len server tinh thi sua DUNG MOT dong "goc". */
  api: {
    goc: 'http://localhost:8001',
    chu_ky_lam_moi_phut: 5,
    het_gio_ms: 15000,
  },

  /* Thiet dat ban do dung chung cho moi tinh. Tam va pham vi thi rieng tung
     tinh nen nam trong tinh/<ma>.json. */
  ban_do_chung: {
    zoom_min: 6,
    zoom_max: 18,
  },

  /* ---------------- Ban do nen ---------------- */
  ban_do_nen: [
    /* Luu y khi doi nguon tile: nhieu dich vu mien phi truoc day (vi du CARTO
       basemaps) nay da yeu cau API key. Cac nguon duoi day dung duoc truc tiep
       khong can dang ky, phu hop cho mot trang tinh tren GitHub Pages. */
    {
      ma: 'sang', ten: 'Nền sáng', mac_dinh: true,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ghi_nguon: 'Nền bản đồ: Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      zoom_max: 16,
    },
    {
      ma: 'duong_pho', ten: 'Đường phố',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ghi_nguon: '&copy; OpenStreetMap contributors',
      zoom_max: 19,
    },
    {
      ma: 've_tinh', ten: 'Ảnh vệ tinh',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ghi_nguon: 'Nguồn ảnh: Esri, Maxar, Earthstar Geographics',
      zoom_max: 18,
    },
    {
      ma: 'dia_hinh', ten: 'Địa hình',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      ghi_nguon: 'Bản đồ: &copy; OpenTopoMap (CC-BY-SA)',
      zoom_max: 17,
    },
    {
      /* Nen dung tu du lieu dia phuong, khong goi dich vu ngoai nao.
         Dia danh bang tieng Viet, co san song suoi dang vung va mat nuoc.
         Cac tep chi duoc tai ve khi nguoi dung chon nen nay. */
      ma: 'dia_phuong', ten: 'Nền địa phương', kieu: 'vector',
      ghi_nguon: 'Bản đồ nền quốc gia (BaseMapVietNam.gdb), cắt theo phạm vi tỉnh',
    },
    {
      ma: 'toi', ten: 'Nền tối',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ghi_nguon: 'Nền bản đồ: Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      zoom_max: 16,
    },
  ],

  /* ---------------- Nen ban do dung tu du lieu dia phuong ----------------
     Cac tep nay sinh ra tu scripts/04_tao_nen_dia_phuong.py, cat tu bo ban do
     nen quoc gia BaseMapVietNam.gdb theo pham vi dat lien cua tinh.
     Lop "dat" dung lai chinh tep ranh gioi xa nen khong ton them dung luong:
     no phu mau dat len nen bien, cac lop con lai ve chong len tren. */
  nen_vector: {
    mau_bien: '#cfe7f2',
    mau_bien_toi: '#16313d',
    lop: [
      { ma: 'dat', ten: 'Phần đất liền', tep: 'ranh_gioi_xa.geojson',
        z: 205, kieu_ve: { color: '#e2ddd2', weight: 0.6, opacity: 0.9,
                           fillColor: '#f4f1e8', fillOpacity: 1 } },

      { ma: 'rung', ten: 'Rừng', tep: 'nen/rung.geojson',
        z: 210, kieu_ve: { stroke: false, fillColor: '#cfe3c4', fillOpacity: 0.95 } },

      { ma: 'bao_ton', ten: 'Vườn quốc gia, khu bảo tồn', tep: 'nen/bao_ton.geojson',
        z: 215, kieu_ve: { color: '#5f9150', weight: 1, opacity: 0.8, dashArray: '4 3',
                           fillColor: '#b9d9ab', fillOpacity: 0.5 } },

      { ma: 'mat_nuoc', ten: 'Mặt nước', tep: 'nen/mat_nuoc.geojson',
        z: 220, kieu_ve: { color: '#6ba8c7', weight: 0.6, opacity: 0.9,
                           fillColor: '#a9d6ea', fillOpacity: 1 } },

      { ma: 'song_vung', ten: 'Sông, suối dạng vùng', tep: 'nen/song_vung.geojson',
        z: 225, kieu_ve: { color: '#6ba8c7', weight: 0.6, opacity: 0.9,
                           fillColor: '#a9d6ea', fillOpacity: 1 } },

      /* Duong bo to mau theo cap: quoc lo dam nhat, duong do thi nhat nhat */
      { ma: 'duong_bo', ten: 'Đường bộ', tep: 'nen/duong_bo.geojson',
        z: 230, zoom_min: 9,
        kieu_ve: function (p) {
          if (p.loaiduongbo === 1) return { color: '#e09b3d', weight: 2.4, opacity: 0.95 };
          if (p.loaiduongbo === 2) return { color: '#edc383', weight: 1.6, opacity: 0.9 };
          return { color: '#d8d4cc', weight: 1.0, opacity: 0.9 };
        } },

      /* Hai lop nhan chu. Trong pham vi tinh co 658 dia danh va 1.432
         diem dan cu, phan lon la thon, lang. Neu hien tu zoom 12 thi chu
         chong len nhau day dac. Dat nguong rieng: dia danh son van thua
         hon nen cho hien som hon mot muc. */
      { ma: 'dia_danh', ten: 'Địa danh', tep: 'nen/dia_danh.geojson',
        z: 240, zoom_min: 13, nhan: 'ten', mau_nhan: '#6b6150',
        kieu_ve: { radius: 1.5, fillColor: '#8a7f6b', color: '#8a7f6b',
                   weight: 0, fillOpacity: 0.8 } },

      { ma: 'dan_cu', ten: 'Điểm dân cư', tep: 'nen/dan_cu.geojson',
        z: 245, zoom_min: 14, nhan: 'ten', mau_nhan: '#4a4a4a',
        kieu_ve: { radius: 2, fillColor: '#777', color: '#fff',
                   weight: 0.8, fillOpacity: 1 } },
    ],
  },

  /* ---------------- Nhom lop trong cay du lieu ---------------- */
  nhom_lop: [
    { ma: 'hanh_chinh', ten: 'Nền và hành chính', mo: true,
      lop: ['ranh_gioi_tinh', 'ranh_gioi_xa'] },
    { ma: 'kiem_ke', ten: 'Kiểm kê nguồn nước mặt', mo: true,
      lop: ['luu_vuc', 'mat_nuoc', 'song_suoi', 'ho_chua',
            'ao_ho_khong_san_lap'] },
    { ma: 'khai_thac_xa_thai', ten: 'Khai thác và xả thải', mo: true,
      lop: ['khai_thac', 'xa_thai'] },
    { ma: 'giam_sat', ten: 'Quan trắc và sức chịu tải', mo: true,
      lop: ['doan_song', 'quan_trac', 'quan_trac_ndd'] },
  ],

  /* ---------------- Dinh nghia tung lop ---------------- */
  lop: {

    /* ===== Ranh gioi hanh chinh (du lieu that) ===== */
    ranh_gioi_tinh: {
      ten: 'Ranh giới tỉnh',
      tep: 'ranh_gioi_tinh.geojson',
      kieu: 'vung',
      hien: true,
      z: 420,
      khoa: 'ma',
      truong_nhan: 'ten',
      du_lieu_that: true,
      khong_truy_van: true,      /* khong tham gia truy van click */
      mo_ta: 'Địa giới hành chính cấp tỉnh sau sáp nhập, hiệu lực từ 01/07/2025',
      kieu_ve: function () {
        return { color: '#475569', weight: 1.8, opacity: 0.85, fill: false,
                 dashArray: null, interactive: false };
      },
      truong: [
        { ma: 'ten', ten: 'Tên đơn vị' },
        { ma: 'dien_tich_km2', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'dan_so', ten: 'Dân số', dinh_dang: 'so', don_vi: 'người' },
        { ma: 'hop_thanh_tu', ten: 'Hợp thành từ' },
        { ma: 'trung_tam_hc', ten: 'Trung tâm hành chính' },
      ],
      cot_bang: ['ten', 'dien_tich_km2', 'dan_so', 'hop_thanh_tu'],
      chu_giai: [{ kieu: 'duong', mau: '#475569', nhan: 'Địa giới tỉnh' }],
    },

    /* ===== Ranh gioi cap xa (du lieu that) ===== */
    ranh_gioi_xa: {
      ten: 'Ranh giới xã, phường',
      tep: 'ranh_gioi_xa.geojson',
      kieu: 'vung',
      hien: true,
      z: 405,
      khoa: 'ma',
      truong_nhan: 'ten',
      du_lieu_that: true,
      mo_ta: 'Ranh giới các xã, phường, đặc khu của tỉnh sau sáp nhập',
      kieu_ve: function () {
        return { color: '#94a3b8', weight: 0.8, opacity: 0.75,
                 fillColor: '#94a3b8', fillOpacity: 0.04 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên đơn vị' },
        { ma: 'phan_loai', ten: 'Phân loại' },
        { ma: 'tinh', ten: 'Thuộc tỉnh' },
        { ma: 'dien_tich_km2', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'dan_so', ten: 'Dân số', dinh_dang: 'so', don_vi: 'người' },
      ],
      cot_bang: ['ma', 'ten', 'phan_loai', 'dien_tich_km2', 'dan_so'],
      chu_giai: [{ kieu: 'vung', mau: '#94a3b8', nhan: 'Ranh giới xã, phường' }],
    },

    /* ===== Luu vuc song ===== */
    luu_vuc: {
      ten: 'Ranh giới lưu vực sông',
      tep: 'luu_vuc.geojson',
      kieu: 'vung',
      hien: true,
      z: 400,
      khoa: 'ma',
      truong_nhan: 'ten',
      mo_ta: 'Ranh giới các lưu vực sông chính trên địa bàn tỉnh',
      kieu_ve: function () {
        return { color: MAU.luu_vuc, weight: 1.4, opacity: 0.8, dashArray: '5 4',
                 fillColor: MAU.luu_vuc, fillOpacity: 0.08 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên lưu vực' },
        { ma: 'dien_tich_km2', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'km²' },
        { ma: 'luong_mua_tb_mm', ten: 'Lượng mưa trung bình', dinh_dang: 'so', don_vi: 'mm/năm' },
        { ma: 'he_so_dong_chay', ten: 'Hệ số dòng chảy', dinh_dang: 'so_le' },
        { ma: 'tong_luong_nuoc_trieu_m3', ten: 'Tổng lượng nước', dinh_dang: 'so_le', don_vi: 'triệu m³/năm' },
      ],
      cot_bang: ['ma', 'ten', 'dien_tich_km2', 'luong_mua_tb_mm', 'tong_luong_nuoc_trieu_m3'],
      chu_giai: [{ kieu: 'vung', mau: MAU.luu_vuc, nhan: 'Lưu vực sông' }],
    },

    /* ===== Ao, ho, dam tu nhien ===== */
    mat_nuoc: {
      ten: 'Ao, hồ, đầm tự nhiên',
      tep: 'mat_nuoc.geojson',
      kieu: 'vung',
      hien: true,
      z: 410,
      khoa: 'ma',
      truong_nhan: 'ten',
      mo_ta: 'Các vùng mặt nước tự nhiên: đầm, ao, hồ, bàu',
      kieu_ve: function () {
        return { color: '#2d7d9a', weight: 1, opacity: 0.9,
                 fillColor: MAU.mat_nuoc, fillOpacity: 0.55 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên' },
        { ma: 'loai', ten: 'Loại hình' },
        { ma: 'dien_tich_ha', ten: 'Diện tích', dinh_dang: 'so_le', don_vi: 'ha' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
      ],
      cot_bang: ['ma', 'ten', 'loai', 'dien_tich_ha', 'ten_luu_vuc'],
      chu_giai: [{ kieu: 'vung', mau: MAU.mat_nuoc, nhan: 'Mặt nước tự nhiên' }],
    },

    /* ===== Song, suoi ===== */
    song_suoi: {
      ten: 'Sông, suối',
      tep: 'song_suoi.geojson',
      kieu: 'duong',
      hien: true,
      z: 440,
      khoa: 'ma',
      truong_nhan: 'ten',
      nhan_tren_ban_do: true,
      zoom_min_nhan: 11,
      mo_ta: 'Mạng lưới sông, suối theo kết quả kiểm kê nguồn nước mặt',
      /* Do day net theo cap song. Phan cap lay tu ma song trong bo kiem ke:
         song chinh, cap I den cap IV va phu luu. */
      kieu_ve: function (p) {
        var day = DAY_NET_SONG[p.cap_song] || 1.4;
        return { color: MAU.song, weight: day, opacity: 0.9, lineCap: 'round' };
      },
      truong: [
        { ma: 'ten', ten: 'Tên sông, suối' },
        { ma: 'cap_song', ten: 'Cấp sông' },
        { ma: 'chieu_dai_km', ten: 'Chiều dài', dinh_dang: 'so_le', don_vi: 'km' },
        { ma: 'chay_ra', ten: 'Chảy ra' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'q_trung_binh_m3s', ten: 'Lưu lượng trung bình', dinh_dang: 'so_le', don_vi: 'm³/s' },
        { ma: 'q_mua_kho_m3s', ten: 'Lưu lượng mùa khô', dinh_dang: 'so_le', don_vi: 'm³/s' },
        { ma: 'muc_dich_su_dung', ten: 'Mục đích sử dụng' },
      ],
      cot_bang: ['ma', 'ten', 'cap_song', 'chieu_dai_km', 'chay_ra', 'ten_luu_vuc'],
      chu_giai: [
        { kieu: 'duong', mau: MAU.song, nhan: 'Sông chính', day: 4.6 },
        { kieu: 'duong', mau: MAU.song, nhan: 'Sông cấp I', day: 3.4 },
        { kieu: 'duong', mau: MAU.song, nhan: 'Sông cấp II', day: 2.4 },
        { kieu: 'duong', mau: MAU.song, nhan: 'Suối cấp III, cấp IV', day: 1.4 },
      ],
    },

    /* ===== Ho chua, dap dang ===== */
    ho_chua: {
      ten: 'Hồ chứa, đập dâng',
      tep: 'ho_chua.geojson',
      kieu: 'diem',
      hien: true,
      z: 450,
      khoa: 'ma',
      truong_nhan: 'ten',
      nhan_tren_ban_do: true,
      zoom_min_nhan: 12,
      mo_ta: 'Hồ chứa, đập dâng và bàu, ao theo kết quả kiểm kê nguồn nước mặt',
      /* Mot mau duy nhat cho ca lop. Truoc day lop nay to mau theo ba nguong
         dung tich 1 va 10 trieu m3; da bo vi nguong la quy uoc tu dat, khong
         theo van ban nao, ma lai de nguoi doc hieu nham la phan cap cong
         trinh theo quy dinh. Ban kinh van theo dung tich toan bo: do la
         thang lien tuc, khong cat nguong, chi de ho lon trong to hon ho nho.

         Khong to mau theo ty le tich nuoc, vi tinh chua co nguon do muc nuoc
         ho tu dong; dung tich la so lieu kiem ke tinh, khong doi theo gio. */
      kieu_ve: function (p) {
        var w = p.w_toan_bo_trieu_m3;
        var bk = Math.max(4.5, Math.min(14, 4 + Math.sqrt(w || 0.2) * 1.2));
        return { radius: bk, fillColor: MAU.mat_nuoc, color: '#ffffff',
                 weight: 1.4, opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên hồ' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'he_thong_song', ten: 'Thuộc hệ thống sông' },
        { ma: 'nguon_nuoc', ten: 'Nguồn nước khai thác' },
        { ma: 'w_toan_bo_trieu_m3', ten: 'Dung tích toàn bộ', dinh_dang: 'so_le', don_vi: 'triệu m³' },
        { ma: 'w_huu_ich_trieu_m3', ten: 'Dung tích hữu ích', dinh_dang: 'so_le', don_vi: 'triệu m³' },
        { ma: 'dt_mat_nuoc_ha', ten: 'Diện tích mặt nước', dinh_dang: 'so_le', don_vi: 'ha' },
        { ma: 'muc_dich', ten: 'Mục đích sử dụng' },
        { ma: 'vi_tri_hc', ten: 'Vị trí hành chính' },
        { ma: 'h_nguong_tran_m', ten: 'Cao trình ngưỡng tràn', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'nam_hoan_thanh', ten: 'Năm hoàn thành' },
        { ma: 'don_vi_quan_ly', ten: 'Đơn vị quản lý' },
        { ma: 'kiem_chung', ten: 'Mức kiểm chứng vị trí' },
      ],
      cot_bang: ['ma', 'ten', 'w_toan_bo_trieu_m3', 'w_huu_ich_trieu_m3',
                 'dt_mat_nuoc_ha', 'muc_dich', 'ten_luu_vuc'],
      chu_giai: [
        { kieu: 'diem', mau: MAU.mat_nuoc,
          nhan: 'Hồ chứa, đập dâng (cỡ ký hiệu theo dung tích)' },
      ],
    },

    /* ===== Ao, ho, dam khong duoc san lap ===== */
    /* Lop nay CHONG LEN ho_chua gan het, vi ca hai cung di tu bieu 3.2. Khac
       nhau o muc dich: ho_chua ve hien trang cong trinh tich nuoc, con lop
       nay la danh muc phap ly theo Dieu 65 Luat Tai nguyen nuoc 2023 va
       Nghi dinh 53/2024. Vi chong len nhau nen mac dinh TAT, nguoi dung bat
       khi can tra cuu danh muc. */
    ao_ho_khong_san_lap: {
      ten: 'Ao, hồ không được san lấp',
      tep: 'ao_ho_khong_san_lap.geojson',
      kieu: 'diem',
      ky_hieu: { hinh: 'thoi' },
      hien: false,
      z: 455,
      khoa: 'ma',
      truong_nhan: 'ten',
      nhan_tren_ban_do: true,
      zoom_min_nhan: 12,
      mo_ta: 'Danh mục ao, hồ, đầm không được san lấp theo phụ lục kết quả kiểm kê',
      /* Mot mau duy nhat cho ca lop, giong cach lam o ho_chua: khong cat
         nguong dung tich, chi cho ban kinh chay theo dung tich toan bo. */
      kieu_ve: function (p) {
        var w = p.w_toan_bo_trieu_m3;
        var bk = Math.max(4.5, Math.min(14, 4 + Math.sqrt(w || 0.2) * 1.2));
        return { radius: bk, fillColor: '#0f766e', color: '#ffffff',
                 weight: 1.4, opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên ao, hồ, đầm' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'he_thong_song', ten: 'Thuộc hệ thống sông' },
        { ma: 'nguon_nuoc', ten: 'Nguồn nước khai thác' },
        { ma: 'w_toan_bo_trieu_m3', ten: 'Dung tích toàn bộ', dinh_dang: 'so_le', don_vi: 'triệu m³' },
        { ma: 'w_huu_ich_trieu_m3', ten: 'Dung tích hữu ích', dinh_dang: 'so_le', don_vi: 'triệu m³' },
        { ma: 'dt_mat_nuoc_ha', ten: 'Diện tích mặt nước', dinh_dang: 'so_le', don_vi: 'ha' },
        { ma: 'muc_dich', ten: 'Mục đích sử dụng' },
        { ma: 'vi_tri_hc', ten: 'Vị trí hành chính' },
        { ma: 'ghi_chu', ten: 'Ghi chú' },
        { ma: 'kiem_chung', ten: 'Mức kiểm chứng vị trí' },
        { ma: 'ly_do_khong_dinh_vi', ten: 'Lý do không có trên bản đồ' },
      ],
      cot_bang: ['ma', 'ten', 'w_toan_bo_trieu_m3', 'dt_mat_nuoc_ha',
                 'muc_dich', 'vi_tri_hc', 'ly_do_khong_dinh_vi'],
      chu_giai: [
        { kieu: 'diem', mau: '#0f766e',
          nhan: 'Ao, hồ không được san lấp (cỡ ký hiệu theo dung tích)' },
      ],
    },

    /* ===== Cong trinh khai thac, su dung nuoc ===== */
    khai_thac: {
      ten: 'Công trình khai thác',
      tep: 'khai_thac.geojson',
      kieu: 'diem',
      /* Ky hieu theo LOAI CONG TRINH, de doc duoc loai ngay tren ban do.
         Tram bom va cong trinh cap nuoc dung ky hieu SVG lay tu bo .qml cua
         QGIS; cac loai con lai dung hinh hinh hoc.

         Danh doi da can nhac: ky hieu SVG ve bang L.marker nen KHONG nhan
         mau cua kieu_ve va khong co gian theo luu luong. Vi vay 112 cong
         trinh thuoc hai nhom do mat ma mau cap phep, doi lay viec nhan ra
         ngay day la tram bom hay cua lay nuoc. Cac nhom con lai van giu
         nguyen ca mau lan co theo luu luong. */
      ky_hieu: function (p) {
        var loai = p && p.loai_hinh;
        /* Hinh TAM GIAC co y khong dung o lop nay: no danh rieng cho lop
           xa_thai, de hai lop khong lan ky hieu voi nhau. */
        if (loai === 'Trạm bơm') return { tep: 'Trambom', co_px: 18 };
        if (loai === 'Công trình cấp nước' || loai === 'Cấp nước tự chảy') {
          return { tep: 'Cong', co_px: 16 };
        }
        if (loai === 'Hồ chứa thủy điện') return { hinh: 'thoi' };
        if (loai === 'Đập dâng') return { hinh: 'chu_nhat' };
        if (loai === 'Hồ chứa thủy lợi') return { hinh: 'vuong' };
        /* Ho tu nhien, khai thac nuoi trong thuy san va loai chua ro */
        return { hinh: 'tron' };
      },
      hien: true,
      z: 460,
      khoa: 'ma',
      truong_nhan: 'ten_cong_trinh',
      mo_ta: 'Công trình khai thác, sử dụng nước mặt theo kết quả điều tra chi tiết',
      /* Mau theo tinh trang cap phep. Phan lon cong trinh trong bo kiem ke la
         cong trinh thuy loi do dia phuong quan ly va chua phai cap phep, nen
         phai co mau rieng cho truong hop do thay vi coi nhu con hieu luc. */
      kieu_ve: function (p) {
        var mau = MAU.trung_tinh;
        if (p.tinh_hinh_cap_phep === 'Đã cấp phép') {
          mau = '#0f766e';
          var con_lai = so_ngay_den(p.ngay_het_han);
          if (con_lai !== null) {
            if (con_lai < 0) mau = MAU.xau;
            else if (con_lai < 180) mau = MAU.theo_doi;
          }
        } else if (p.tinh_hinh_cap_phep === 'Giấy phép đã hết hạn') {
          mau = MAU.xau;
        }
        /* Co ky hieu theo luu luong, thang log vi luu luong trai tu vai m3
           den 4,5 trieu m3 moi ngay.

           Ban kinh nay la ban kinh cua HINH TRON tuong duong; KyHieuHinh
           trong ky_hieu.js nhan them HE_SO_HINH.vuong = 0,86 de hinh vuong
           co dien tich bang hinh tron do, nen canh hinh vuong bang 1,72 lan
           ban kinh. Thang cu (3,5 + log10(q) x 1,9, tran 12) cho canh 7,7
           den 20,6 px va day MOT PHAN MUOI so cong trinh len sat tran: o
           vung dong cong trinh cac hinh vuong dinh vao nhau, vua che mat lop
           song suoi ben duoi vua lam mat y nghia phan cap. Thang nay cho
           canh 6,0 den 13,8 px, giu nguyen thu tu to nho. */
        var q = p.q_cap_phep_m3_ngay || 100;
        var bk = Math.max(3.5, Math.min(8, 2.2 + Math.log10(q) * 1.2));
        return { radius: bk, fillColor: mau, color: '#ffffff', weight: 1.2,
                 opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'ten_cong_trinh', ten: 'Tên công trình, chủ hộ' },
        { ma: 'loai_hinh', ten: 'Loại công trình khai thác' },
        { ma: 'muc_dich_su_dung', ten: 'Mục đích sử dụng' },
        { ma: 'chu_giay_phep', ten: 'Tổ chức, cá nhân quản lý' },
        { ma: 'tinh_hinh_cap_phep', ten: 'Tình hình cấp phép' },
        { ma: 'so_giay_phep', ten: 'Số giấy phép' },
        { ma: 'ngay_cap', ten: 'Ngày cấp', dinh_dang: 'ngay' },
        { ma: 'ngay_het_han', ten: 'Ngày hết hạn', dinh_dang: 'ngay' },
        { ma: 'nguon_nuoc_khai_thac', ten: 'Nguồn nước khai thác' },
        { ma: 'q_cap_phep_m3_ngay', ten: 'Lượng nước khai thác', dinh_dang: 'so', don_vi: 'm³/ngày' },
        { ma: 'q_thuc_te_m3_ngay', ten: 'Lưu lượng thực tế', dinh_dang: 'so', don_vi: 'm³/ngày' },
        { ma: 'xa', ten: 'Xã, phường' },
        { ma: 'tinh_cu', ten: 'Thuộc tỉnh cũ' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'kiem_chung', ten: 'Mức kiểm chứng vị trí' },
      ],
      cot_bang: ['ma', 'ten_cong_trinh', 'loai_hinh', 'muc_dich_su_dung',
                 'q_cap_phep_m3_ngay', 'tinh_hinh_cap_phep', 'xa'],
      /* Chu giai hai phan: hinh noi loai cong trinh, mau noi tinh trang cap
         phep. Hai nhom dung ky hieu SVG khong to mau duoc nen de o phan hinh. */
      chu_giai: [
        { kieu: 'diem', ky_hieu: { hinh: 'vuong' }, mau: MAU.trung_tinh,
          nhan: 'Hồ chứa thủy lợi (401)' },
        { kieu: 'diem', ky_hieu: { hinh: 'thoi' }, mau: MAU.trung_tinh,
          nhan: 'Hồ chứa thủy điện (38)' },
        { kieu: 'diem', ky_hieu: { hinh: 'chu_nhat' }, mau: MAU.trung_tinh,
          nhan: 'Đập dâng (93)' },
        { kieu: 'diem', ky_hieu: 'Trambom', nhan: 'Trạm bơm (102)' },
        { kieu: 'diem', ky_hieu: 'Cong', nhan: 'Công trình cấp nước (10)' },
        { kieu: 'diem', ky_hieu: { hinh: 'tron' }, mau: MAU.trung_tinh,
          nhan: 'Hồ tự nhiên, loại khác (10)' },
        { kieu: 'diem', mau: '#0f766e', nhan: 'Giấy phép còn hiệu lực' },
        { kieu: 'diem', mau: MAU.theo_doi, nhan: 'Hết hạn trong 6 tháng' },
        { kieu: 'diem', mau: MAU.xau, nhan: 'Giấy phép đã hết hạn' },
        { kieu: 'diem', mau: MAU.trung_tinh, nhan: 'Chưa cấp phép' },
      ],
    },

    /* ===== Diem xa nuoc thai ===== */
    xa_thai: {
      ten: 'Điểm xả nước thải',
      tep: 'xa_thai.geojson',
      kieu: 'diem',
      /* MOT ky hieu tam giac cho ca lop, khong phan hinh theo nguon thai.
         Hinh tam giac chi lop nay dung, nen tren ban do thay tam giac la
         biet ngay diem xa thai ma khong phai tra chu giai. Nguon thai van
         tra cuu duoc o bang thuoc tinh va o hop thong tin doi tuong.
         Mau va co van theo luu luong xa, xem kieu_ve ben duoi. */
      ky_hieu: { hinh: 'tam_giac' },
      hien: true,
      z: 470,
      khoa: 'ma',
      truong_nhan: 'ten_cong_trinh',
      mo_ta: 'Các điểm xả nước thải vào nguồn nước theo kết quả điều tra chi tiết',
      /* Hai kenh thi giac tach bach, moi kenh noi mot chuyen:

           CO ky hieu  -> luu luong xa, ba muc 100 va 1.000 m3/ngay
           MAU ky hieu -> co vuot quy chuan hay khong

         Ba muc co roi rac chu khong phai thang lien tuc, de doc duoc muc nao
         ngay tren ban do ma khong phai uoc luong duong kinh.

         Luu y ve mau: phieu dieu tra khong do BOD5, COD nen cot
         vuot_quy_chuan HIEN DANG RONG o ca 155 diem. Vi vay thuc te moi diem
         deu ra mau den. Khi nao co ket luan quy chuan thi diem vuot se tu
         chuyen sang do, khong phai sua gi them. */
      kieu_ve: function (p) {
        var q = Number(p.q_xa_m3_ngay) || 0;
        var bk = 5;                      // duoi 100 m3/ngay
        if (q >= 1000) bk = 11;
        else if (q >= 100) bk = 8;

        /* Den chu khong lay tu MAU: bang mau khong co mau den, va o day den
           chi la mau nen trung tinh de mau do cua diem vuot chuan noi han. */
        var mau = (p.vuot_quy_chuan === 'Có') ? MAU.xau : '#000000';
        return { radius: bk, fillColor: mau, color: '#ffffff', weight: 1.4,
                 opacity: 1, fillOpacity: 0.9 };
      },
      truong: [
        { ma: 'ten_cong_trinh', ten: 'Tên cơ sở' },
        { ma: 'nguon_thai', ten: 'Loại nguồn thải' },
        { ma: 'linh_vuc_san_xuat', ten: 'Lĩnh vực sản xuất' },
        { ma: 'tinh_hinh_cap_phep', ten: 'Tình hình cấp phép' },
        { ma: 'so_giay_phep', ten: 'Số giấy phép' },
        { ma: 'ngay_cap', ten: 'Ngày cấp', dinh_dang: 'ngay' },
        { ma: 'ngay_het_han', ten: 'Ngày hết hạn', dinh_dang: 'ngay' },
        { ma: 'nguon_tiep_nhan', ten: 'Nguồn tiếp nhận' },
        { ma: 'q_xa_m3_ngay', ten: 'Lưu lượng xả', dinh_dang: 'so', don_vi: 'm³/ngày' },
        { ma: 'he_thong_xu_ly', ten: 'Có hệ thống xử lý' },
        { ma: 'ph', ten: 'pH nước thải', dinh_dang: 'so_le' },
        { ma: 'do_mg_l', ten: 'DO nước thải', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'nhiet_do_c', ten: 'Nhiệt độ nước thải', dinh_dang: 'so_le', don_vi: '°C' },
        { ma: 'bod5_mg_l', ten: 'BOD5', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'cod_mg_l', ten: 'COD', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'amoni_mg_l', ten: 'Amoni (N)', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'tong_n_mg_l', ten: 'Tổng N', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'tong_p_mg_l', ten: 'Tổng P', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'qcvn_ap_dung', ten: 'Quy chuẩn áp dụng' },
        { ma: 'vuot_quy_chuan', ten: 'Vượt quy chuẩn' },
        { ma: 'xa', ten: 'Xã, phường' },
        { ma: 'tinh_cu', ten: 'Thuộc tỉnh cũ' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'kiem_chung', ten: 'Mức kiểm chứng vị trí' },
      ],
      cot_bang: ['ma', 'ten_cong_trinh', 'nguon_thai', 'nguon_tiep_nhan',
                 'q_xa_m3_ngay', 'tinh_hinh_cap_phep', 'xa'],
      /* Chu giai tach lam hai phan dung theo hai kenh thi giac cua kieu_ve:
         ba dong dau noi ve CO, hai dong sau noi ve MAU. */
      chu_giai: [
        { kieu: 'diem', mau: '#000000', co_px: 22, nhan: 'Xả từ 1.000 m³/ngày' },
        { kieu: 'diem', mau: '#000000', co_px: 16, nhan: 'Xả 100 - 1.000 m³/ngày' },
        { kieu: 'diem', mau: '#000000', co_px: 11, nhan: 'Xả dưới 100 m³/ngày' },
        { kieu: 'diem', mau: '#000000', nhan: 'Chưa vượt quy chuẩn' },
        { kieu: 'diem', mau: MAU.xau, nhan: 'Vượt quy chuẩn' },
      ],
    },

    /* ===== Phan doan song danh gia suc chiu tai ===== */
    doan_song: {
      ten: 'Sức chịu tải đoạn sông',
      tep: 'doan_song.geojson',
      /* Nguon du lieu la lop phan vung tiep nhan nuoc thai, moi doan song la
         mot vung doc long song chu khong phai mot duong, nen kieu la 'vung'. */
      kieu: 'vung',
      hien: false,
      z: 415,
      khoa: 'ma',
      truong_nhan: 'ten_doan',
      mo_ta: 'Phân đoạn sông và mức chất lượng nước áp dụng theo QCVN 08:2023, '
           + 'phục vụ đánh giá khả năng tiếp nhận nước thải theo TT 76/2017/TT-BTNMT',
      /* To mau theo ket luan suc chiu tai. Hien chua doan nao ket luan duoc vi
         thieu luu luong dong chay Qs, nen phan lon se la mau trung tinh. */
      kieu_ve: function (p) {
        var mau = MAU.trung_tinh;
        if (p.trang_thai === 'Không còn khả năng tiếp nhận') mau = MAU.xau;
        else if (p.trang_thai === 'Gần ngưỡng') mau = MAU.theo_doi;
        else if (p.trang_thai === 'Còn khả năng tiếp nhận') mau = MAU.tot;
        return { color: mau, weight: 1.4, opacity: 0.9,
                 fillColor: mau, fillOpacity: 0.35 };
      },
      truong: [
        { ma: 'ten_doan', ten: 'Phạm vi đoạn sông' },
        { ma: 'ten_song', ten: 'Thuộc sông' },
        { ma: 'he_thong_song', ten: 'Hệ thống sông' },
        { ma: 'chieu_dai_km', ten: 'Chiều dài đoạn', dinh_dang: 'so_le', don_vi: 'km' },
        { ma: 'muc_dich_su_dung', ten: 'Mức chất lượng nước áp dụng' },
        { ma: 'thong_so', ten: 'Thông số đánh giá' },
        { ma: 'c_qc_mg_l', ten: 'Giới hạn quy chuẩn Cqc', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'so_diem_xa', ten: 'Số điểm xả thải trong đoạn', dinh_dang: 'so' },
        { ma: 'q_xa_tong_m3_ngay', ten: 'Tổng lưu lượng xả', dinh_dang: 'so', don_vi: 'm³/ngày' },
        { ma: 'q_s_m3s', ten: 'Lưu lượng dòng chảy Qs', dinh_dang: 'so_le', don_vi: 'm³/s' },
        { ma: 'c_nn_mg_l', ten: 'Nồng độ hiện có Cnn', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'l_td_kg_ngay', ten: 'Tải lượng tối đa Ltđ', dinh_dang: 'so_le', don_vi: 'kg/ngày' },
        { ma: 'l_nn_kg_ngay', ten: 'Tải lượng sẵn có Lnn', dinh_dang: 'so_le', don_vi: 'kg/ngày' },
        { ma: 'l_t_kg_ngay', ten: 'Tải lượng nguồn thải Lt', dinh_dang: 'so_le', don_vi: 'kg/ngày' },
        { ma: 'f_s', ten: 'Hệ số an toàn Fs', dinh_dang: 'so_le' },
        { ma: 'l_tn_kg_ngay', ten: 'Khả năng tiếp nhận Ltn', dinh_dang: 'so_le', don_vi: 'kg/ngày' },
        { ma: 'ty_le_con_lai', ten: 'Tỷ lệ còn lại', dinh_dang: 'phan_tram' },
        { ma: 'trang_thai', ten: 'Kết luận' },
        { ma: 'can_cu', ten: 'Căn cứ phương pháp' },
      ],
      cot_bang: ['ma', 'ten_song', 'ten_doan', 'chieu_dai_km',
                 'muc_dich_su_dung', 'so_diem_xa', 'q_xa_tong_m3_ngay',
                 'trang_thai'],
      chu_giai: [
        { kieu: 'vung', mau: MAU.tot, nhan: 'Còn khả năng tiếp nhận' },
        { kieu: 'vung', mau: MAU.theo_doi, nhan: 'Gần ngưỡng' },
        { kieu: 'vung', mau: MAU.xau, nhan: 'Không còn khả năng tiếp nhận' },
        { kieu: 'vung', mau: MAU.trung_tinh, nhan: 'Chưa đủ số liệu quan trắc' },
      ],
    },

    /* ===== Tram, diem quan trac ===== */
    quan_trac: {
      ten: 'Trạm, điểm quan trắc',
      tep: 'quan_trac.geojson',
      kieu: 'diem',
      hien: true,
      z: 480,
      khoa: 'ma',
      truong_nhan: 'ten',
      realtime: true,
      mo_ta: 'Trạm thủy văn, điểm quan trắc chất lượng nước mặt và lỗ khoan quan trắc nước dưới đất',
      /* Ky hieu lay tu bo .qml cua QGIS trong CSDL/symbol_QGIS, chuyen sang
         SVG bang scripts/06_tao_ky_hieu.py. Moi loai tram mot ky hieu. */
      ky_hieu: function (p) {
        if (p && p.loai_tram === 'Thủy văn') return { tep: 'Tramthuyvan' };
        if (p && p.loai_tram === 'Nước dưới đất') return { tep: 'Lokhoan_TK' };
        return { tep: 'Diemlaymaunuocsong', co_px: 26 };
      },
      kieu_ve: function (p, rt) {
        var mau = p.loai_tram === 'Thủy văn' ? '#2563eb'
                : (p.loai_tram === 'Mưa' ? '#7c3aed'
                : (p.loai_tram === 'Nước dưới đất' ? '#b45309' : '#059669'));
        var vien = '#ffffff';
        var day = 1.5;
        /* Vien do khi diem quan trac dang o trang thai canh bao */
        if (rt && rt.trang_thai === 'canh_bao') { vien = MAU.xau; day = 2.6; }
        else if (rt && rt.trang_thai === 'theo_doi') { vien = MAU.theo_doi; day = 2.4; }
        return { radius: 6, fillColor: mau, color: vien, weight: day,
                 opacity: 1, fillOpacity: 0.95 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên trạm, điểm' },
        { ma: 'loai_tram', ten: 'Loại' },
        { ma: 'song_ho', ten: 'Trên sông, hồ' },
        { ma: 'thong_so', ten: 'Thông số quan trắc' },
        { ma: 'mo_ta', ten: 'Mô tả vị trí' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'tan_suat_do', ten: 'Tần suất đo' },
        { ma: 'don_vi_quan_ly', ten: 'Đơn vị quản lý' },
        /* Rieng cua lo khoan quan trac nuoc duoi dat. Tram nuoc mat de khuyet
           cac truong nay va giao dien bo qua o khuyet. */
        { ma: 'tang_chua_nuoc', ten: 'Tầng chứa nước' },
        { ma: 'cao_do_mieng_lk_m', ten: 'Cao độ miệng lỗ khoan', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'vi_tri_hc', ten: 'Vị trí hành chính' },
        { ma: 'mang_quan_trac', ten: 'Mạng quan trắc' },
        { ma: 'thiet_bi_do', ten: 'Thiết bị quan trắc' },
        { ma: 'ngay_bat_dau', ten: 'Bắt đầu quan trắc', dinh_dang: 'ngay' },
      ],
      cot_bang: ['ma', 'ten', 'loai_tram', 'song_ho', 'ten_luu_vuc', 'tan_suat_do'],
      /* Khong khai bao lo khoan nuoc duoi dat o day. Chu giai nay la cua
         TRANG BAN DO, ma trang ban do doc data/quan_trac.geojson tinh, trong
         do khong co lo khoan nao; them vao se la mot muc chu giai khong ung
         voi doi tuong nao tren ban do. Lo khoan chi co o tab Quan trac, va
         tab do tu sinh chu giai tu cac loai tram dang ve, xem
         ve_chu_giai_qt() trong assets/js/quan_trac.js. */
      /* Moi dong PHAI khai ky_hieu cua chinh no. Khong khai thi dung_chu_giai()
         goi khai_bao_ky_hieu(dn, {}, null) voi thuoc tinh rong; ham ky_hieu o
         tren phan nhanh theo p.loai_tram nen roi xuong nhanh mac dinh va ve
         Diemlaymaunuocsong cho ca hai dong, lech voi ban do.

         Khong dat mau o day: ky hieu SVG ve bang the <img> nen giu nguyen mau
         cua bo .qml, khong nhan fillColor. */
      chu_giai: [
        { kieu: 'diem', ky_hieu: 'Tramthuyvan', nhan: 'Trạm thủy văn' },
        { kieu: 'diem', ky_hieu: 'Diemlaymaunuocsong',
          nhan: 'Điểm quan trắc chất lượng nước' },
      ],
    },

    /* ===== Lo khoan quan trac nuoc duoi dat (du lieu that, QTQG) =====

       Lop nay do scripts/08_xuat_lo_khoan_ndd.py sinh ra tu CSDL QTQG, KHONG
       phai tu CSDL/ nhu cac lop chuyen de khac.

       Vi sao la lop tinh chu khong goi thang backend: ban do chinh phai chay
       duoc khi khong co dich vu nao dang chay. Doi lai, so do trong lop nay
       la so do o thoi diem xuat; truong nguon_dl cua tung doi tuong ghi ro
       dieu do, va tab Quan trac moi la cho xem so moi nhat.

       Khong co truong WQI: Quyet dinh 1460/QD-TCMT la chi so chat luong nuoc
       MAT luc dia, nguong nuoc duoi dat theo QCVN 09-MT:2015/BTNMT. */
    quan_trac_ndd: {
      ten: 'Lỗ khoan quan trắc nước dưới đất',
      tep: 'quan_trac_ndd.geojson',
      kieu: 'diem',
      hien: true,
      z: 478,
      khoa: 'ma',
      truong_nhan: 'ten',
      mo_ta: '65 lỗ khoan đang hoạt động của mạng quan trắc quốc gia',
      ky_hieu: { tep: 'Lokhoan_TK' },
      /* Ky hieu la tep SVG nen mau tu tep quyet dinh. Khai bao nay chi dung
         lam du phong khi danh muc ky hieu chua nap xong. */
      kieu_ve: function () {
        return { radius: 6, fillColor: '#b45309', color: '#ffffff',
                 weight: 1.5, opacity: 1, fillOpacity: 0.95 };
      },
      truong: [
        { ma: 'ten', ten: 'Tên lỗ khoan' },
        { ma: 'tang_chua_nuoc', ten: 'Tầng chứa nước' },
        { ma: 'vi_tri_hc', ten: 'Vị trí hành chính' },
        { ma: 'ten_luu_vuc', ten: 'Lưu vực' },
        { ma: 'cao_do_mieng_lk_m', ten: 'Cao độ miệng lỗ khoan', dinh_dang: 'so_le', don_vi: 'm' },
        /* Số đo tại thời điểm xuất lớp */
        { ma: 'h_ngam_m', ten: 'Mực nước (dưới miệng lỗ khoan)', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'cao_do_mn_m', ten: 'Cao độ mặt nước', dinh_dang: 'so_le', don_vi: 'm' },
        { ma: 'thoi_diem_muc_nuoc', ten: 'Thời điểm đo mực nước', dinh_dang: 'thoi_diem' },
        { ma: 'nhiet_do_c', ten: 'Nhiệt độ', dinh_dang: 'so_le', don_vi: '°C' },
        { ma: 'thoi_diem_chat_luong', ten: 'Thời điểm lấy mẫu phân tích', dinh_dang: 'thoi_diem' },
        { ma: 'ph', ten: 'pH', dinh_dang: 'so_le' },
        { ma: 'tds_mg_l', ten: 'Tổng chất rắn hòa tan (TDS)', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'do_cung_mg_l', ten: 'Độ cứng (theo CaCO₃)', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'permanganat_mg_l', ten: 'Chỉ số pemanganat', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'amoni_mg_l', ten: 'Amoni (N-NH₄⁺)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'nitrat_mg_l', ten: 'Nitrat (N-NO₃⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'nitrit_mg_l', ten: 'Nitrit (N-NO₂⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'clorua_mg_l', ten: 'Clorua (Cl⁻)', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'sunfat_mg_l', ten: 'Sunfat (SO₄²⁻)', dinh_dang: 'so_le', don_vi: 'mg/L' },
        { ma: 'florua_mg_l', ten: 'Florua (F⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'xyanua_mg_l', ten: 'Xyanua (CN⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'fe_mg_l', ten: 'Sắt tổng (Fe)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'fe2_mg_l', ten: 'Sắt (II)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'fe3_mg_l', ten: 'Sắt (III)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'mn_mg_l', ten: 'Mangan (Mn)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'as_mg_l', ten: 'Asen (As)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'cd_mg_l', ten: 'Cadimi (Cd)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'pb_mg_l', ten: 'Chì (Pb)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'cr_mg_l', ten: 'Crom tổng (Cr)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'cu_mg_l', ten: 'Đồng (Cu)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'zn_mg_l', ten: 'Kẽm (Zn)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'hg_mg_l', ten: 'Thủy ngân (Hg)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'se_mg_l', ten: 'Selen (Se)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'phenol_mg_l', ten: 'Phenol', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
        { ma: 'coliform_mpn_100ml', ten: 'Coliform', dinh_dang: 'so', don_vi: 'MPN/100mL' },
        { ma: 'ecoli_mpn_100ml', ten: 'E. coli', dinh_dang: 'so', don_vi: 'MPN/100mL' },
        { ma: 'mang_quan_trac', ten: 'Mạng quan trắc' },
        { ma: 'thiet_bi_do', ten: 'Thiết bị quan trắc' },
        { ma: 'ngay_bat_dau', ten: 'Bắt đầu quan trắc', dinh_dang: 'ngay' },
      ],
      cot_bang: ['ma', 'ten', 'tang_chua_nuoc', 'vi_tri_hc', 'h_ngam_m',
                 'thoi_diem_muc_nuoc'],
      chu_giai: [
        { kieu: 'diem', mau: '#b45309',
          nhan: 'Lỗ khoan quan trắc nước dưới đất' },
      ],
    },
  },

  /* ---------------- Nhan trang thai thoi gian thuc ---------------- */
  nhan_trang_thai: {
    binh_thuong: 'Bình thường',
    theo_doi: 'Cần theo dõi',
    canh_bao: 'Cảnh báo',
  },

  /* ---------------- Truong hien thi cho du lieu thoi gian thuc ---------------- */
  truong_realtime: {
    ho_chua: [
      { ma: 'muc_nuoc_m', ten: 'Mực nước hiện tại', dinh_dang: 'so_le', don_vi: 'm' },
      { ma: 'ty_le_dung_tich', ten: 'Tỷ lệ dung tích hữu ích', dinh_dang: 'phan_tram' },
      { ma: 'w_hien_tai_trieu_m3', ten: 'Lượng nước hiện có', dinh_dang: 'so_le', don_vi: 'triệu m³' },
    ],
    thuy_van: [
      { ma: 'h_m', ten: 'Mực nước', dinh_dang: 'so_le', don_vi: 'm' },
      { ma: 'q_m3s', ten: 'Lưu lượng', dinh_dang: 'so_le', don_vi: 'm³/s' },
      { ma: 'mua_1h_mm', ten: 'Lượng mưa 1 giờ', dinh_dang: 'so_le', don_vi: 'mm' },
      { ma: 'mua_24h_mm', ten: 'Lượng mưa 24 giờ', dinh_dang: 'so_le', don_vi: 'mm' },
    ],
    mua: [
      { ma: 'mua_1h_mm', ten: 'Lượng mưa 1 giờ', dinh_dang: 'so_le', don_vi: 'mm' },
      { ma: 'mua_24h_mm', ten: 'Lượng mưa 24 giờ', dinh_dang: 'so_le', don_vi: 'mm' },
    ],
    /* Danh sach nay la nguon su that duy nhat ve nhan, don vi va dinh dang cua
       moi thong so chat luong nuoc. Bang, bang chi tiet, bieu do va CSV deu
       sinh tu day. Ban ghi nao khong co thong so nao thi giao dien bo qua,
       khong hien dong trong. */
    chat_luong_nuoc: [
      { ma: 'wqi', ten: 'Chỉ số WQI', dinh_dang: 'so' },
      { ma: 'phan_loai_wqi', ten: 'Phân loại' },
      /* Nhom co ban */
      { ma: 'ph', ten: 'pH', dinh_dang: 'so_le' },
      { ma: 'do_mg_l', ten: 'DO', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'nhiet_do_c', ten: 'Nhiệt độ', dinh_dang: 'so_le', don_vi: '°C' },
      { ma: 'ec_us_cm', ten: 'Độ dẫn điện', dinh_dang: 'so', don_vi: 'µS/cm' },
      { ma: 'tss_mg_l', ten: 'TSS', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'do_duc_ntu', ten: 'Độ đục', dinh_dang: 'so_le', don_vi: 'NTU' },
      /* Nhom mo rong */
      { ma: 'cod_mg_l', ten: 'COD', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'bod5_mg_l', ten: 'BOD5', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'amoni_mg_l', ten: 'Amoni (N-NH₄⁺)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'nitrat_mg_l', ten: 'Nitrat (N-NO₃⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'nitrit_mg_l', ten: 'Nitrit (N-NO₂⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'photphat_mg_l', ten: 'Photphat (P-PO₄³⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'toc_mg_l', ten: 'TOC', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'coliform_mpn_100ml', ten: 'Tổng Coliform', dinh_dang: 'so', don_vi: 'MPN/100mL' },
      { ma: 'ecoli_mpn_100ml', ten: 'E. coli', dinh_dang: 'so', don_vi: 'MPN/100mL' },
      /* Kim loai nang, nhom III cua Quyet dinh 1460 */
      { ma: 'as_mg_l', ten: 'Asen (As)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'cd_mg_l', ten: 'Cadimi (Cd)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'pb_mg_l', ten: 'Chì (Pb)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'cr6_mg_l', ten: 'Crom VI (Cr⁶⁺)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'cu_mg_l', ten: 'Đồng (Cu)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'zn_mg_l', ten: 'Kẽm (Zn)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'hg_mg_l', ten: 'Thủy ngân (Hg)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      /* Thuoc bao ve thuc vat, nhom II cua Quyet dinh 1460, don vi microgam */
      { ma: 'aldrin_ug_l', ten: 'Aldrin', dinh_dang: 'vi_luong', don_vi: 'µg/L' },
      { ma: 'bhc_ug_l', ten: 'BHC', dinh_dang: 'vi_luong', don_vi: 'µg/L' },
      { ma: 'dieldrin_ug_l', ten: 'Dieldrin', dinh_dang: 'vi_luong', don_vi: 'µg/L' },
      { ma: 'ddts_ug_l', ten: 'Tổng DDT', dinh_dang: 'vi_luong', don_vi: 'µg/L' },
      { ma: 'heptachlor_ug_l', ten: 'Heptachlor', dinh_dang: 'vi_luong', don_vi: 'µg/L' },
    ],
    /* Nhom nuoc duoi dat, lay tu mang quan trac quoc gia qua backend QTQG.
       65 lo khoan dang hoat dong trong pham vi tinh.

       Vi sao h_ngam_m khong dung chung truong voi h_m cua nuoc mat: nuoc mat
       la cao do mat nuoc theo moc cua tram (so duong), con day la do sau mat
       nuoc duoi mieng lo khoan (so AM). Hai dai luong nguoc nghia, gop lam
       mot truong la ve chung mot bieu do va chung mot cot bang.

       KHONG co truong WQI o nhom nay. Quyet dinh 1460/QD-TCMT la chi so chat
       luong nuoc MAT luc dia; nguong cac thong so nuoc duoi dat theo
       QCVN 09-MT:2015/BTNMT. Backend chan viec tinh WQI cho ban ghi lo khoan,
       xem wqi.gan_wqi(). */
    nuoc_duoi_dat: [
      { ma: 'h_ngam_m', ten: 'Mực nước (dưới miệng lỗ khoan)', dinh_dang: 'so_le', don_vi: 'm' },
      { ma: 'cao_do_mn_m', ten: 'Cao độ mặt nước', dinh_dang: 'so_le', don_vi: 'm' },
      { ma: 'thoi_diem_muc_nuoc', ten: 'Thời điểm đo mực nước', dinh_dang: 'thoi_diem' },
      { ma: 'tang_chua_nuoc', ten: 'Tầng chứa nước' },
      { ma: 'nhiet_do_c', ten: 'Nhiệt độ', dinh_dang: 'so_le', don_vi: '°C' },
      { ma: 'thoi_diem_chat_luong', ten: 'Thời điểm lấy mẫu phân tích', dinh_dang: 'thoi_diem' },
      /* Thong so hoa hoc theo QCVN 09-MT:2015/BTNMT */
      { ma: 'ph', ten: 'pH', dinh_dang: 'so_le' },
      { ma: 'tds_mg_l', ten: 'Tổng chất rắn hòa tan (TDS)', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'do_cung_mg_l', ten: 'Độ cứng (theo CaCO₃)', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'permanganat_mg_l', ten: 'Chỉ số pemanganat', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'ec_us_cm', ten: 'Độ dẫn điện', dinh_dang: 'so', don_vi: 'µS/cm' },
      { ma: 'do_mg_l', ten: 'DO', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'amoni_mg_l', ten: 'Amoni (N-NH₄⁺)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'nitrat_mg_l', ten: 'Nitrat (N-NO₃⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'nitrit_mg_l', ten: 'Nitrit (N-NO₂⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'photphat_mg_l', ten: 'Photphat (P-PO₄³⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'clorua_mg_l', ten: 'Clorua (Cl⁻)', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'sunfat_mg_l', ten: 'Sunfat (SO₄²⁻)', dinh_dang: 'so_le', don_vi: 'mg/L' },
      { ma: 'florua_mg_l', ten: 'Florua (F⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'xyanua_mg_l', ten: 'Xyanua (CN⁻)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      /* Sat: nguon ghi ba cot roi. Khong cong Fe(II) voi Fe(III) de ra sat
         tong, vi do la suy dien chu khong phai so do. */
      { ma: 'fe_mg_l', ten: 'Sắt tổng (Fe)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'fe2_mg_l', ten: 'Sắt (II)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'fe3_mg_l', ten: 'Sắt (III)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'mn_mg_l', ten: 'Mangan (Mn)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'as_mg_l', ten: 'Asen (As)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'cd_mg_l', ten: 'Cadimi (Cd)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'pb_mg_l', ten: 'Chì (Pb)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      /* Crom TONG, khong phai Cr(VI): nguon chi co cot crom chung */
      { ma: 'cr_mg_l', ten: 'Crom tổng (Cr)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'cu_mg_l', ten: 'Đồng (Cu)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'zn_mg_l', ten: 'Kẽm (Zn)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'hg_mg_l', ten: 'Thủy ngân (Hg)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'se_mg_l', ten: 'Selen (Se)', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'phenol_mg_l', ten: 'Phenol', dinh_dang: 'vi_luong', don_vi: 'mg/L' },
      { ma: 'coliform_mpn_100ml', ten: 'Coliform', dinh_dang: 'so', don_vi: 'MPN/100mL' },
      { ma: 'ecoli_mpn_100ml', ten: 'E. coli', dinh_dang: 'so', don_vi: 'MPN/100mL' },
    ],
    khai_thac: [
      { ma: 'q_thuc_te_m3_ngay', ten: 'Lưu lượng khai thác hôm nay', dinh_dang: 'so', don_vi: 'm³/ngày' },
      { ma: 'ty_le_su_dung', ten: 'So với hạn mức giấy phép', dinh_dang: 'phan_tram' },
    ],
  },
};

/* --------------------------------------------------------------------------
   Tien ich dung chung
   -------------------------------------------------------------------------- */

/* So ngay tu hom nay den mot ngay cho truoc, am neu da qua */
function so_ngay_den(chuoi_ngay) {
  if (!chuoi_ngay) return null;
  var d = new Date(chuoi_ngay);
  if (isNaN(d.getTime())) return null;
  var hom_nay = new Date();
  hom_nay.setHours(0, 0, 0, 0);
  return Math.round((d - hom_nay) / 86400000);
}

/* Bo dau tieng Viet de tim kiem khong phan biet dau */
function bo_dau(chu) {
  return String(chu || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
}

/* Lay nhan hien thi cua mot doi tuong */
function nhan_doi_tuong(ma_lop, props) {
  var dn = CAU_HINH.lop[ma_lop];
  if (!dn) return '';
  return props[dn.truong_nhan] || props[dn.khoa] || '(không tên)';
}
