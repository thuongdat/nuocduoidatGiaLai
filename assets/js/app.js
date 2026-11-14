/* ==========================================================================
   app.js - Khoi dong ung dung va gan su kien cho giao dien
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  khoi_phuc_giao_dien();

  /* Canh bao khi mo tep truc tiep bang duong dan file:// */
  if (location.protocol === 'file:') {
    canh_bao_mo_sai_cach();
    return;
  }

  /* Phai biet dang xem tinh nao truoc khi khoi tao ban do, vi tam ban do,
     pham vi va danh sach lop deu lay tu tep tham so cua tinh. */
  nap_tinh()
    .then(function () {
      khoi_tao_ban_do();
      gan_su_kien_giao_dien();
      /* Nap du lieu quan trac va danh muc ky hieu truoc, de cac lop co mau
         va ky hieu dung ngay tu lan ve dau, khong phai ve lai lan hai */
      return Promise.all([nap_realtime(), nap_danh_muc_ky_hieu()]);
    })
    .then(nap_tat_ca_lop)
    .then(function () {
      document.getElementById('man-cho').hidden = true;
      /* Tinh lai kich thuoc khung ban do truoc khi khop pham vi, neu khong
         Leaflet van dung kich thuoc luc trang moi dung xong va khop sai. */
      ban_do.invalidateSize();
      ve_toan_tinh();
      bat_lam_moi_dinh_ky();
      bao_cao_lop_loi();
      cap_nhat_dai_thong_bao();
    })
    .catch(function (e) {
      document.getElementById('man-cho').hidden = true;
      console.error('Không khởi động được ứng dụng:', e);
      hien_mach_bao('Không khởi động được: ' + e.message, 10000);
    });
});

/* Dai ghi chu dau trang. Chi hien khi tinh.json co truong ghi_chu_dau_trang,
   va noi dung lay nguyen tu truong do. */
function cap_nhat_dai_thong_bao() {
  var dai = document.getElementById('dai-thong-bao');
  if (!dai) return;
  var o = document.getElementById('noi-dung-thong-bao');
  /* Moi trang ban do co ghi chu rieng trong tinh.json; trang khac trang chinh
     khai ten truong o CAU_HINH.truong_ghi_chu_dau_trang */
  var ghi_chu = TINH[CAU_HINH.truong_ghi_chu_dau_trang || 'ghi_chu_dau_trang'];
  if (ghi_chu) {
    if (o) o.innerHTML = ghi_chu;
    dai.hidden = false;
  } else {
    dai.hidden = true;
  }
}

/* --------------------------------------------------------------------------
   Thu gon, mo hai bang hai ben
   --------------------------------------------------------------------------
   ben la 'trai' (lop du lieu) hoac 'phai' (thong tin doi tuong). Nguong
   860px phai khop voi khoi @media (max-width: 860px) trong style.css.
   -------------------------------------------------------------------------- */
function la_man_hinh_hep() {
  return !!window.matchMedia && window.matchMedia('(max-width: 860px)').matches;
}

function dang_thu_gon(ben) {
  return document.querySelector('.than-trang').classList.contains('thu-' + ben);
}

function dat_thu_gon(ben, thu) {
  var than = document.querySelector('.than-trang');
  if (thu) than.classList.add('thu-' + ben);
  else than.classList.remove('thu-' + ben);

  /* Mui ten chi huong ma bang se di khi bam */
  var mui_trai = '&#10094;', mui_phai = '&#10095;';
  var nut = document.getElementById('thu-gon-' + ben);
  if (ben === 'trai') nut.innerHTML = thu ? mui_phai : mui_trai;
  else nut.innerHTML = thu ? mui_trai : mui_phai;

  /* Tren dien thoai moi luc chi mo mot ngan, neu khong hai ngan de len nhau */
  if (!thu && la_man_hinh_hep()) {
    var ben_kia = ben === 'trai' ? 'phai' : 'trai';
    if (!dang_thu_gon(ben_kia)) dat_thu_gon(ben_kia, true);
  }

  if (typeof ban_do !== 'undefined' && ban_do) {
    setTimeout(function () { ban_do.invalidateSize(); }, 220);
  }
}


/* --------------------------------------------------------------------------
   Gan su kien cho toan bo giao dien
   -------------------------------------------------------------------------- */
function gan_su_kien_giao_dien() {

  /* ----- Thu gon hai bang hai ben ----- */
  document.getElementById('thu-gon-trai').addEventListener('click', function () {
    dat_thu_gon('trai', !dang_thu_gon('trai'));
  });

  document.getElementById('thu-gon-phai').addEventListener('click', function () {
    dat_thu_gon('phai', !dang_thu_gon('phai'));
  });

  /* Tren dien thoai hai bang la ngan truot phu len ban do (xem khoi
     max-width: 860px trong style.css), nen mo trang thi thu san ca hai de
     thay ban do truoc. */
  if (la_man_hinh_hep()) {
    dat_thu_gon('trai', true);
    dat_thu_gon('phai', true);
  }

  /* ----- Bo loc ----- */
  document.getElementById('ap-dung-loc').addEventListener('click', ap_dung_loc);
  document.getElementById('xoa-loc').addEventListener('click', xoa_loc);
  document.getElementById('loc-tu-khoa').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') ap_dung_loc();
  });

  /* ----- Danh sach tha xuong khi mot diem nhap trung nhieu doi tuong ----- */
  document.getElementById('danh-sach-trung').addEventListener('change', function () {
    hien_chi_tiet(KET_QUA_TRUNG, Number(this.value));
  });

  /* ----- Cong cu tren ban do ----- */
  document.getElementById('cc-toan-tinh').addEventListener('click', ve_toan_tinh);

  document.getElementById('cc-do-khoang-cach').addEventListener('click', function () {
    bat_tat_cong_cu('do_khoang_cach', 'cc-do-khoang-cach');
  });

  document.getElementById('cc-chon-ban-kinh').addEventListener('click', function () {
    bat_tat_cong_cu('chon_ban_kinh', 'cc-chon-ban-kinh');
  });

  document.getElementById('cc-toa-do').addEventListener('click', function () {
    bat_tat_cong_cu('toa_do', 'cc-toa-do');
  });

  document.getElementById('cc-ve-vung').addEventListener('click', function () {
    bat_tat_cong_cu('ve_vung', 'cc-ve-vung');
  });

  /* Nhan Esc de huy cong cu dang dung */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('hop-thoai').hidden) { dong_hop_thoai(); return; }
    if (cong_cu_dang_bat) {
      document.getElementById(cong_cu_dang_bat.id_nut).classList.remove('dang-bat');
      huy_cong_cu();
    }
  });

  /* ----- Bang thuoc tinh ----- */
  document.getElementById('mo-bang').addEventListener('click', function () {
    var khu = document.getElementById('khu-bang');
    khu.classList.toggle('mo');
    this.setAttribute('aria-expanded', khu.classList.contains('mo') ? 'true' : 'false');
    /* Tren dien thoai bang thuoc tinh da chiem gan nua man hinh; de them mot
       ngan truot len nua thi khong con thay ban do. */
    if (khu.classList.contains('mo') && la_man_hinh_hep()) {
      dat_thu_gon('trai', true);
      dat_thu_gon('phai', true);
    }
    setTimeout(function () { ban_do.invalidateSize(); }, 220);
  });

  document.getElementById('xuat-csv').addEventListener('click', xuat_bang_csv);
  document.getElementById('xuat-geojson').addEventListener('click', xuat_bang_geojson);

  /* ----- Tim kiem ----- */
  var o_tim = document.getElementById('o-tim-kiem');
  var o_kq = document.getElementById('ket-qua-tim');

  o_tim.addEventListener('input', function () {
    var kq = tim_kiem(o_tim.value);
    if (o_tim.value.trim().length < 2) { o_kq.hidden = true; return; }

    o_kq.innerHTML = '';
    if (kq.length === 0) {
      o_kq.innerHTML = '<li class="khong-co">Không tìm thấy đối tượng phù hợp</li>';
    } else {
      kq.forEach(function (m) {
        var li = document.createElement('li');
        li.innerHTML = m.ten + '<small>' + m.ten_lop
                     + (m.ma ? ' &middot; ' + m.ma : '') + '</small>';
        li.addEventListener('click', function () {
          o_kq.hidden = true;
          o_tim.value = '';
          di_den_doi_tuong(m.ma_lop, m.chi_so);
        });
        o_kq.appendChild(li);
      });
    }
    o_kq.hidden = false;
  });

  /* An ket qua tim khi nhap ra ngoai */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.o-tim-kiem')) o_kq.hidden = true;
  });

  /* ----- Menu dieu huong ----- */
  var cac_muc = document.querySelectorAll('.dau-trang__menu a');
  for (var i = 0; i < cac_muc.length; i++) {
    cac_muc[i].addEventListener('click', function (e) {
      /* Muc nao tro den mot trang that thi de trinh duyet chuyen trang */
      var dich = this.getAttribute('href');
      if (dich && dich !== '#') return;

      e.preventDefault();
      var trang = this.dataset.trang;
      if (trang === 'canh-bao') mo_hop_canh_bao();
      else if (trang === 'huong-dan') mo_hop_huong_dan();
      /* Muc "Bản đồ" khong mo hop thoai, chi dong hop dang mo */
      else dong_hop_thoai();
    });
  }

  /* ----- Doi nen sang / toi ----- */
  document.getElementById('nut-giao-dien').addEventListener('click', doi_giao_dien);

  /* ----- Dong dai thong bao ----- */
  document.getElementById('dong-thong-bao').addEventListener('click', function () {
    document.getElementById('dai-thong-bao').hidden = true;
    setTimeout(function () { ban_do.invalidateSize(); }, 50);
  });

  /* ----- Hop thoai ----- */
  document.getElementById('dong-hop-thoai').addEventListener('click', dong_hop_thoai);
  document.getElementById('lop-mo').addEventListener('click', dong_hop_thoai);

  /* ----- Hien nhan va lop nen theo muc zoom ----- */
  /* Nhan ten phai cap nhat ca khi keo ban do, khong chi khi doi muc zoom, vi
     chi gan nhan cho doi tuong dang nam trong khung nhin. */
  ban_do.on('zoomend', cap_nhat_hien_nhan);
  ban_do.on('moveend', cap_nhat_hien_nhan);
  ban_do.on('zoomend', cap_nhat_nen_theo_zoom);
}

/* Hop thoai dung chung: mo_hop_thoai() va dong_hop_thoai() da chuyen sang
   assets/js/dung_chung.js, vi trang thong ke va trang quan trac cung can
   nhung khong nap duoc tep nay. */

/* Thong ke tong hop nay nam o trang rieng pages/thong-ke.html,
   xem assets/js/thong-ke.js. */

/* --------------------------------------------------------------------------
   Hop thoai huong dan su dung
   -------------------------------------------------------------------------- */
function mo_hop_huong_dan() {
  var html = '<div class="doan-huong-dan">'

    + '<h3>Truy vấn thông tin đối tượng</h3>'
    + '<ol>'
    + '<li>Nhấp chuột vào một đối tượng trên bản đồ. Thông tin hiện ở bảng bên phải.</li>'
    + '<li>Nếu điểm nhấp trúng nhiều đối tượng, ví dụ một điểm xả thải nằm trên '
    + 'đoạn sông và trong ranh giới lưu vực, hệ thống hiện một danh sách thả xuống '
    + 'liệt kê tất cả. Chọn mục nào thì xem thuộc tính của mục đó.</li>'
    + '<li>Nút <em>Xuất CSV</em> trong bảng thông tin xuất thuộc tính của riêng '
    + 'đối tượng đang xem, kèm số liệu quan trắc mới nhất.</li>'
    + '</ol>'

    + '<h3>Bảng thuộc tính và xuất dữ liệu</h3>'
    + '<ul>'
    + '<li>Mở bảng ở cạnh dưới màn hình, chọn lớp cần xem.</li>'
    + '<li>Nhấp vào tiêu đề cột để sắp xếp, nhấp vào một dòng để phóng tới '
    + 'đối tượng trên bản đồ.</li>'
    + '<li><em>Xuất CSV</em> xuất toàn bộ trường thuộc tính kèm toạ độ tâm, '
    + 'theo đúng bộ lọc và thứ tự đang hiển thị. Tệp có BOM UTF-8 nên Excel '
    + 'đọc đúng tiếng Việt có dấu.</li>'
    + '<li><em>Xuất GeoJSON</em> giữ nguyên hình học, mở được ngay trong QGIS '
    + 'hoặc đọc bằng <code>geopandas.read_file()</code>.</li>'
    + '</ul>'

    + '<h3>Công cụ hỗ trợ thẩm định</h3>'
    + '<ul>'
    + '<li><strong>Chọn theo bán kính</strong>: nhấp đặt tâm, nhấp lần hai để chốt '
    + 'bán kính. Hệ thống liệt kê mọi đối tượng thuộc các lớp đang bật trong vòng đó, '
    + 'sắp theo khoảng cách. Dùng để tìm các điểm xả thải quanh một công trình cấp nước '
    + 'trước khi cấp phép.</li>'
    + '<li><strong>Chọn theo xã</strong>: chọn xã, phường trong khối <em>Bộ lọc nhanh</em> '
    + 'rồi bấm <em>Áp dụng</em>. Bản đồ và bảng thuộc tính chỉ còn các đối tượng có '
    + 'hình học giao với ranh giới xã, kể cả sông suối chỉ chảy qua một phần.</li>'
    + '<li><strong>Chọn theo vùng vẽ tay</strong>: bấm nút vẽ vùng, nhấp lần lượt các '
    + 'đỉnh, nhấp đúp để khép vùng. Hộp tóm tắt liệt kê số đối tượng theo từng lớp và '
    + 'cho xuất danh sách gộp ra CSV. Bấm <em>Xóa lọc</em> để bỏ vùng.</li>'
    + '<li><strong>Đo khoảng cách</strong>: nhấp lần lượt các điểm, nhấp đúp để kết thúc.</li>'
    + '<li><strong>Xem toạ độ</strong>: nhấp vào bản đồ để lấy toạ độ WGS84 của điểm đó.</li>'
    + '<li>Nhấn <code>Esc</code> để huỷ công cụ đang dùng.</li>'
    + '</ul>';

  /* Hai muc duoi chi co nghia o trang ban do nuoc mat. Trang nuoc duoi dat
     dung chung tep nay nhung khong co lop doan_song. */
  if (CAU_HINH.lop.doan_song) {
    html += '<h3>Lớp sức chịu tải</h3>'
    + '<p>Lớp <em>Sức chịu tải đoạn sông</em> mặc định tắt. Khi bật, mỗi đoạn sông '
    + 'được tô màu theo khả năng tiếp nhận nước thải đối với thông số BOD5, tính theo '
    + 'phương pháp đánh giá trực tiếp của Thông tư 76/2017/TT-BTNMT (sửa đổi bởi '
    + 'Thông tư 02/2022/TT-BTNMT):</p>'
    + '<ul>'
    + '<li>Tải lượng tối đa: <code>Ltđ = Cqc × Qs × 86,4</code></li>'
    + '<li>Tải lượng ô nhiễm sẵn có: <code>Lnn = Cnn × Qs × 86,4</code></li>'
    + '<li>Khả năng tiếp nhận: <code>Ltn = (Ltđ − Lnn − Lt) × Fs</code></li>'
    + '</ul>'
    + '<p>Nhấp vào một đoạn sông để xem đầy đủ các thành phần của phép tính.</p>'

    + '<h3>Dữ liệu thời gian thực</h3>'
    + '<p>Mực nước hồ, lưu lượng, lượng mưa và chỉ số WQI nằm trong tệp '
    + '<code>data/realtime.json</code>, được cập nhật định kỳ bằng GitHub Actions. '
    + 'Trang web tự làm mới sau mỗi '
    + CAU_HINH.he_thong.chu_ky_lam_moi_phut + ' phút. '
    + 'Hiện số liệu này là mô phỏng, chưa kết nối nguồn quan trắc chính thức.</p>';
  }

  html += '</div>';

  mo_hop_thoai('Hướng dẫn sử dụng', html);
}

/* --------------------------------------------------------------------------
   Nen sang / toi
   -------------------------------------------------------------------------- */
function doi_giao_dien() {
  var hien_tai = document.documentElement.getAttribute('data-giao-dien');
  var moi;
  if (hien_tai === 'toi') moi = 'sang';
  else if (hien_tai === 'sang') moi = 'toi';
  else {
    /* Chua chon lan nao: dao nguoc so voi thiet dat cua he dieu hanh */
    var he_toi = window.matchMedia('(prefers-color-scheme: dark)').matches;
    moi = he_toi ? 'sang' : 'toi';
  }

  document.documentElement.setAttribute('data-giao-dien', moi);
  try { localStorage.setItem('giao_dien', moi); } catch (e) { /* bo qua */ }

  /* Doi ban do nen cho khop voi nen giao dien */
  dat_lop_nen(moi === 'toi' ? 'toi' : 'sang');

  /* Ve lai bieu do de doi mau chu va luoi */
  if (KET_QUA_TRUNG.length > 0) {
    var chon = KET_QUA_TRUNG[Number(document.getElementById('danh-sach-trung').value) || 0];
    if (chon) {
      var l = LOP[chon.ma_lop];
      ve_bieu_do_realtime(l.doi_tuong[chon.chi_so].thuoc_tinh[l.dn.khoa]);
    }
  }
}

function khoi_phuc_giao_dien() {
  try {
    var da_luu = localStorage.getItem('giao_dien');
    if (da_luu) document.documentElement.setAttribute('data-giao-dien', da_luu);
  } catch (e) { /* trinh duyet chan localStorage, bo qua */ }
}

/* --------------------------------------------------------------------------
   Thong bao khi co lop khong nap duoc
   -------------------------------------------------------------------------- */
function bao_cao_lop_loi() {
  var cac_loi = Object.keys(LOP).filter(function (ma) { return LOP[ma].loi; });
  if (cac_loi.length === 0) return;

  var ten = cac_loi.map(function (ma) { return CAU_HINH.lop[ma].ten; }).join(', ');
  hien_mach_bao('Chưa nạp được lớp: ' + ten
              + '. Xem hướng dẫn tạo dữ liệu trong README.', 8000);
}

/* --------------------------------------------------------------------------
   Canh bao khi mo bang duong dan file://
   Trinh duyet chan fetch() tren giao thuc file nen khong nap duoc GeoJSON.
   -------------------------------------------------------------------------- */
function canh_bao_mo_sai_cach() {
  document.getElementById('man-cho').hidden = true;
  document.querySelector('.khu-ban-do').innerHTML =
      '<div style="display:grid;place-content:center;height:100%;padding:28px;'
    + 'text-align:center;max-width:620px;margin:0 auto">'
    + '<h2 style="margin-bottom:10px;font-size:16px">Cần chạy qua máy chủ web</h2>'
    + '<p style="font-size:13px;line-height:1.7;color:var(--chu-mo)">'
    + 'Trang đang được mở trực tiếp từ ổ đĩa (<code>file://</code>). '
    + 'Trình duyệt chặn việc đọc tệp GeoJSON theo cách này, nên bản đồ không nạp được '
    + 'dữ liệu.</p>'
    + '<p style="font-size:13px;line-height:1.7;color:var(--chu-mo);margin-top:12px">'
    + 'Mở terminal tại thư mục dự án và chạy:</p>'
    + '<pre style="margin:10px 0;padding:11px 14px;background:var(--nen-chim);'
    + 'border:1px solid var(--vien);border-radius:6px;font-size:13px;text-align:left">'
    + 'python -m http.server 8000</pre>'
    + '<p style="font-size:13px;color:var(--chu-mo)">Rồi mở '
    + '<strong>http://localhost:8000</strong>. '
    + 'Khi đưa lên GitHub Pages thì không cần bước này.</p>'
    + '</div>';
}
