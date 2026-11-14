/* ==========================================================================
   layers.js - Nap du lieu, ve lop len ban do, cay lop, chu giai, bo loc
   ========================================================================== */

/* Kho du lieu trung tam: ma_lop -> trang thai cua lop do */
var LOP = {};

/* Chi muc tim kiem: danh sach phang moi doi tuong de tra cuu nhanh */
var CHI_MUC_TIM = [];

/* Bo loc dang ap dung */
var BO_LOC = { ma_luu_vuc: '', tu_khoa: '', vung: null };

/* Lop khong bi loc theo vung: ranh gioi hanh chinh la boi canh, va neu loc
   theo giao hinh hoc thi cac xa lan can chi cham ranh gioi cung hien ra.
   Vung loc do assets/js/loc_khong_gian.js dat vao BO_LOC.vung. */
var LOP_MIEN_LOC_VUNG = { ranh_gioi_tinh: true, ranh_gioi_xa: true };

/* --------------------------------------------------------------------------
   Nap toan bo lop du lieu
   -------------------------------------------------------------------------- */
function nap_tat_ca_lop() {
  /* Moi tinh mot khac: tinh moi lap co the chi co lop ranh gioi. Chi nap
     nhung lop duoc liet ke trong tinh/<ma>.json. */
  var cac_ma = Object.keys(CAU_HINH.lop).filter(lop_co_san);
  var cac_viec = cac_ma.map(function (ma) {
    var dn = CAU_HINH.lop[ma];
    /* Lop nang khai tai_tre va dang tat thi chua tai: chi dat cho trong LOP,
       den khi nguoi dung bat lop moi tai, xem tai_lop_tre(). */
    if (dn.tai_tre && !dn.hien) {
      LOP[ma] = { dn: dn, ma: ma, doi_tuong: [], nhom: null,
                  hien: false, loi: null, chua_tai: true };
      return Promise.resolve();
    }
    return nap_mot_lop(ma);
  });
  return Promise.all(cac_viec).then(function () {
    dung_chi_muc_tim();
    dung_bo_loc_luu_vuc();
    dung_bo_loc_xa();
    dung_cay_lop();
    dung_chu_giai();
    dung_chon_lop_bang();
  });
}

function nap_mot_lop(ma_lop) {
  var dn = CAU_HINH.lop[ma_lop];
  LOP[ma_lop] = { dn: dn, ma: ma_lop, doi_tuong: [], nhom: null,
                  hien: dn.hien, loi: null };

  return fetch(duong_dan_du_lieu(dn.tep))
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (gj) {
      LOP[ma_lop].geojson = gj;
      LOP[ma_lop].doi_tuong = (gj.features || []).map(function (f, i) {
        return {
          ma_lop: ma_lop,
          chi_so: i,
          thuoc_tinh: f.properties || {},
          hinh_hoc: f.geometry,
        };
      });
      ve_lop(ma_lop);
    })
    .catch(function (e) {
      LOP[ma_lop].loi = e.message;
      console.warn('Không nạp được lớp ' + ma_lop
                 + ' (' + duong_dan_du_lieu(dn.tep) + '): ' + e.message);
    });
}

/* --------------------------------------------------------------------------
   Ve mot lop len ban do, co ap dung bo loc hien hanh
   -------------------------------------------------------------------------- */
function ve_lop(ma_lop) {
  var l = LOP[ma_lop];
  if (!l || l.loi) return;
  var dn = l.dn;

  if (l.nhom) { ban_do.removeLayer(l.nhom); l.nhom = null; }

  var danh_sach_ve = l.doi_tuong.filter(qua_bo_loc);
  l.so_hien = danh_sach_ve.length;

  var nhom = L.featureGroup([], { pane: 'pane-' + ma_lop });

  danh_sach_ve.forEach(function (dt) {
    var rt = lay_realtime(dt.thuoc_tinh[dn.khoa]);
    var hinh = tao_hinh_leaflet(dt, dn, rt);
    if (!hinh) return;
    hinh._ma_lop = ma_lop;
    hinh._chi_so = dt.chi_so;
    dt.hinh = hinh;
    nhom.addLayer(hinh);

    /* Nhan ten tren ban do cho mot so lop. Chi ghi san chuoi nhan o day, con
       viec gan nhan that do cap_nhat_hien_nhan() lam theo muc zoom. */
    if (dn.nhan_tren_ban_do) {
      hinh._nhan_ban_do = nhan_doi_tuong(ma_lop, dt.thuoc_tinh);
    }
  });

  l.nhom = nhom;
  if (l.hien) nhom.addTo(ban_do);

  cap_nhat_hien_nhan();
  cap_nhat_dem_cay_lop(ma_lop);
}

/* Tao doi tuong Leaflet tuong ung mot feature */
function tao_hinh_leaflet(dt, dn, rt) {
  var hh = dt.hinh_hoc;
  if (!hh) return null;
  var kieu_ve = dn.kieu_ve(dt.thuoc_tinh, rt);

  if (hh.type === 'Point') {
    kieu_ve.pane = 'pane-' + dt.ma_lop;
    var toa_do = [hh.coordinates[1], hh.coordinates[0]];

    /* Lop co khai bao ky_hieu thi ve bang ky hieu lay tu QGIS, xem
       assets/js/ky_hieu.js. Khong co thi giu vong tron nhu truoc. */
    if (typeof tao_diem_co_ky_hieu === 'function') {
      var diem = tao_diem_co_ky_hieu(toa_do, dn, dt.thuoc_tinh, rt,
                                     { pane: 'pane-' + dt.ma_lop });
      if (diem) return diem;
    }

    return L.circleMarker(toa_do, kieu_ve);
  }

  /* Duong va vung: dung L.geoJSON de xu ly ca Multi* */
  return L.geoJSON(
    { type: 'Feature', geometry: hh, properties: dt.thuoc_tinh },
    { style: kieu_ve, pane: 'pane-' + dt.ma_lop,
      interactive: kieu_ve.interactive !== false }
  );
}

/* Nguong zoom mac dinh de hien nhan ten doi tuong. Lop nao dong doi tuong hon
   thi khai bao zoom_min_nhan rieng trong config.js. */
var ZOOM_MIN_NHAN = 10;

/* Gan hoac bo nhan ten theo muc zoom hien tai.
   --------------------------------------------------------------------------
   Khong gan san nhan cho moi doi tuong roi an ca pane di, vi lam vay thi
   trinh duyet van phai giu va ve lai tung the nhan. Voi Gia Lai, rieng hai lop
   song suoi va ho chua da la 666 nhan, du de trang giat va chup anh bi treo.
   Vi vay chi gan nhan khi da zoom du gan, va bo ngay khi zoom ra. */
function cap_nhat_hien_nhan() {
  var zoom = ban_do.getZoom();

  /* Noi khung nhin ra mot chut de nhan cua doi tuong vua ra khoi man hinh
     khong bi bo ngay, keo ban do qua lai do giat. */
  var khung = ban_do.getBounds().pad(0.2);

  Object.keys(LOP).forEach(function (ma_lop) {
    var l = LOP[ma_lop];
    var dn = CAU_HINH.lop[ma_lop];
    if (!l || !l.nhom || !dn || !dn.nhan_tren_ban_do) return;

    var du_zoom = l.hien && zoom >= (dn.zoom_min_nhan || ZOOM_MIN_NHAN);

    l.nhom.eachLayer(function (hinh) {
      if (!hinh._nhan_ban_do) return;

      /* Chi gan nhan cho doi tuong dang nam trong khung nhin. Leaflet khong tu
         lam viec nay: no ve the nhan cho moi doi tuong da bind, ke ca doi tuong
         cach man hinh hang tram km. */
      var nen_hien = du_zoom && trong_khung_nhin(hinh, khung);
      var dang_co = !!hinh.getTooltip();

      if (nen_hien && !dang_co) {
        hinh.bindTooltip(hinh._nhan_ban_do, {
          permanent: true, direction: 'center', className: 'nhan-ban-do',
          pane: 'pane-nhan', opacity: 1,
        });
      } else if (!nen_hien && dang_co) {
        hinh.unbindTooltip();
      }
    });
  });
}

/* Doi tuong Leaflet co giao voi khung nhin hay khong. Diem thi dung getLatLng,
   duong va vung thi dung getBounds. */
function trong_khung_nhin(hinh, khung) {
  if (typeof hinh.getLatLng === 'function') {
    return khung.contains(hinh.getLatLng());
  }
  if (typeof hinh.getBounds === 'function') {
    var b = hinh.getBounds();
    return b.isValid() && khung.intersects(b);
  }
  return true;
}

/* --------------------------------------------------------------------------
   Bat tat lop
   -------------------------------------------------------------------------- */
function dat_hien_lop(ma_lop, hien) {
  var l = LOP[ma_lop];
  if (!l) return;
  if (l.chua_tai) {
    if (hien) tai_lop_tre(ma_lop);
    return;
  }
  if (!l.nhom) return;
  l.hien = hien;
  if (hien) l.nhom.addTo(ban_do);
  else ban_do.removeLayer(l.nhom);
  cap_nhat_hien_nhan();
  dung_chu_giai();
}

/* --------------------------------------------------------------------------
   Tai mot lop khai tai_tre khi nguoi dung bat no lan dau
   -------------------------------------------------------------------------- */
function tai_lop_tre(ma_lop) {
  var l = LOP[ma_lop];
  if (!l || !l.chua_tai || l.dang_tai) return;
  l.dang_tai = true;
  hien_mach_bao('Đang tải lớp ' + l.dn.ten + '...', 60000);

  /* nap_mot_lop() thay LOP[ma_lop] bang mot doi tuong moi, khong con co
     chua_tai, roi goi ve_lop() */
  nap_mot_lop(ma_lop).then(function () {
    var moi = LOP[ma_lop];
    var hop_chon = document.getElementById('chon-' + ma_lop);

    if (moi.loi) {
      hien_mach_bao('Không tải được lớp ' + moi.dn.ten + ': ' + moi.loi, 6000);
      if (hop_chon) { hop_chon.checked = false; hop_chon.disabled = true; }
      cap_nhat_dem_cay_lop(ma_lop);
      return;
    }

    /* Dang loc theo vung thi phai tinh giao cho lop vua tai roi ve lai */
    if (BO_LOC.vung && typeof tinh_trung_mot_lop === 'function') {
      BO_LOC.vung.trung[ma_lop] = tinh_trung_mot_lop(ma_lop, BO_LOC.vung.hinh_hoc);
      ve_lop(ma_lop);
    }

    /* Nguoi dung co the da bo chon trong luc cho tai */
    dat_hien_lop(ma_lop, !hop_chon || hop_chon.checked);
    cap_nhat_dem_cay_lop(ma_lop);
    dung_chi_muc_tim();
    dung_chon_lop_bang();
    hien_mach_bao('Đã tải lớp ' + moi.dn.ten + ': '
                + moi.doi_tuong.length.toLocaleString('vi-VN') + ' đối tượng.', 2500);
  });
}

/* --------------------------------------------------------------------------
   Cay lop du lieu o bang trai
   -------------------------------------------------------------------------- */
function dung_cay_lop() {
  var hop = document.getElementById('cay-lop');
  hop.innerHTML = '';

  CAU_HINH.nhom_lop.forEach(function (nhom) {
    /* Nhom nao khong con lop nao thuoc tinh nay thi khong hien */
    if (!nhom.lop.some(lop_co_san)) return;

    var khoi = document.createElement('div');
    khoi.className = 'nhom-lop' + (nhom.mo ? '' : ' dong');

    var dau = document.createElement('div');
    dau.className = 'nhom-lop__dau';
    dau.innerHTML = '<span class="nhom-lop__mui">&#9660;</span>'
                  + '<span>' + nhom.ten + '</span>';
    dau.addEventListener('click', function () { khoi.classList.toggle('dong'); });
    khoi.appendChild(dau);

    var than = document.createElement('div');
    than.className = 'nhom-lop__than';

    nhom.lop.forEach(function (ma_lop) {
      if (!lop_co_san(ma_lop)) return;
      var l = LOP[ma_lop];
      var dn = CAU_HINH.lop[ma_lop];
      if (!dn) return;

      var hang = document.createElement('div');
      hang.className = 'hang-lop' + (l && l.loi ? ' loi' : '');

      var hop_chon = document.createElement('input');
      hop_chon.type = 'checkbox';
      hop_chon.id = 'chon-' + ma_lop;
      hop_chon.checked = !!(l && l.hien && !l.loi);
      hop_chon.disabled = !!(l && l.loi);
      hop_chon.addEventListener('change', function () {
        dat_hien_lop(ma_lop, hop_chon.checked);
      });

      var nhan = document.createElement('label');
      nhan.htmlFor = hop_chon.id;
      nhan.textContent = dn.ten;
      nhan.title = (l && l.loi)
        ? 'Không nạp được tệp ' + duong_dan_du_lieu(dn.tep) + ': ' + l.loi
        : dn.mo_ta || dn.ten;

      var dem = document.createElement('span');
      dem.className = 'hang-lop__dem';
      dem.id = 'dem-' + ma_lop;
      dem.textContent = (l && l.loi) ? '!' : (l ? l.doi_tuong.length : 0);
      /* Lop tai tre chua biet so doi tuong cho den khi duoc bat */
      if (l && l.chua_tai) {
        dem.textContent = '...';
        dem.title = 'Lớp nặng, chỉ tải khi bật';
      }

      hang.appendChild(hop_chon);
      hang.appendChild(nhan);
      hang.appendChild(dem);
      than.appendChild(hang);
    });

    khoi.appendChild(than);
    hop.appendChild(khoi);
  });
}

function cap_nhat_dem_cay_lop(ma_lop) {
  var o = document.getElementById('dem-' + ma_lop);
  if (!o) return;
  var l = LOP[ma_lop];
  if (!l) return;
  if (l.loi) { o.textContent = '!'; return; }
  if (l.chua_tai) { o.textContent = '...'; return; }
  o.title = '';
  o.textContent = (l.so_hien !== undefined && l.so_hien !== l.doi_tuong.length)
    ? l.so_hien + '/' + l.doi_tuong.length
    : l.doi_tuong.length;
}

/* --------------------------------------------------------------------------
   Chu giai, chi hien cho cac lop dang bat
   -------------------------------------------------------------------------- */
function dung_chu_giai() {
  var hop = document.getElementById('chu-giai');
  hop.innerHTML = '';
  var co_gi = false;

  Object.keys(CAU_HINH.lop).filter(lop_co_san).forEach(function (ma_lop) {
    var l = LOP[ma_lop];
    var dn = CAU_HINH.lop[ma_lop];
    if (!l || !l.hien || l.loi || !dn.chu_giai) return;
    co_gi = true;

    var nhom = document.createElement('div');
    nhom.className = 'chu-giai__nhom';
    nhom.innerHTML = '<div class="chu-giai__ten">' + dn.ten + '</div>';

    dn.chu_giai.forEach(function (cg) {
      var hang = document.createElement('div');
      hang.className = 'chu-giai__hang';
      /* Lop co ky hieu rieng thi chu giai ve dung ky hieu do, khong ve o
         mau vuong, de nguoi doc nhan ra ngay tren ban do. */
      var html_kh = '';
      if (cg.kieu === 'diem' && typeof chu_giai_ky_hieu === 'function') {
        var kb_cg = cg.ky_hieu
          ? (typeof cg.ky_hieu === 'string' ? { tep: cg.ky_hieu } : cg.ky_hieu)
          : khai_bao_ky_hieu(dn, {}, null);
        if (kb_cg) {
          /* co_px cho phep mot lop dung nhieu co trong chu giai, de dien ta
           phan cap theo do lon ky hieu; xem lop xa_thai trong config.js. */
        html_kh = chu_giai_ky_hieu(kb_cg, { fillColor: cg.mau,
                                              color: '#ffffff' }, cg.co_px);
        }
      }

      if (html_kh) {
        var bao = document.createElement('span');
        bao.className = 'chu-giai__o chu-giai__o--kh';
        bao.innerHTML = html_kh;
        hang.appendChild(bao);
      } else {
        var o = document.createElement('span');
        o.className = 'chu-giai__o chu-giai__o--' + cg.kieu;
        o.style.background = cg.mau;
        if (cg.kieu === 'duong' && cg.day) o.style.height = cg.day + 'px';
        if (cg.kieu === 'vung') o.style.opacity = '0.55';
        hang.appendChild(o);
      }
      hang.appendChild(document.createTextNode(cg.nhan));
      nhom.appendChild(hang);
    });

    hop.appendChild(nhom);
  });

  if (!co_gi) {
    hop.innerHTML = '<p class="ghi-chu-nho">Chưa bật lớp dữ liệu nào.</p>';
  }
}

/* --------------------------------------------------------------------------
   Bo loc
   -------------------------------------------------------------------------- */
function qua_bo_loc(dt) {
  var tt = dt.thuoc_tinh;

  if (BO_LOC.ma_luu_vuc) {
    /* Lop luu vuc tu loc bang chinh ma cua no */
    var ma_lv = (dt.ma_lop === 'luu_vuc') ? tt.ma : tt.ma_luu_vuc;
    if (ma_lv !== BO_LOC.ma_luu_vuc) return false;
  }

  if (BO_LOC.tu_khoa) {
    var ten = bo_dau(nhan_doi_tuong(dt.ma_lop, tt));
    if (ten.indexOf(BO_LOC.tu_khoa) < 0) return false;
  }

  /* Vung loc: tap doi tuong giao voi vung da duoc tinh san khi dat vung */
  if (BO_LOC.vung && !LOP_MIEN_LOC_VUNG[dt.ma_lop]) {
    var trung = BO_LOC.vung.trung[dt.ma_lop];
    if (!trung || !trung[dt.chi_so]) return false;
  }

  return true;
}

function dung_bo_loc_luu_vuc() {
  var o = document.getElementById('loc-luu-vuc');
  var l = LOP['luu_vuc'];
  if (!l || l.loi) return;
  l.doi_tuong.forEach(function (dt) {
    var opt = document.createElement('option');
    opt.value = dt.thuoc_tinh.ma;
    opt.textContent = dt.thuoc_tinh.ten;
    o.appendChild(opt);
  });
}

function ap_dung_loc() {
  BO_LOC.ma_luu_vuc = document.getElementById('loc-luu-vuc').value;
  BO_LOC.tu_khoa = bo_dau(document.getElementById('loc-tu-khoa').value.trim());

  /* Xa dang chon trong danh sach. Vung ve tay khong di qua o nay nen duoc
     giu nguyen khi o de trong. */
  var ma_xa = document.getElementById('loc-xa').value;
  var vua_dat_xa = false;
  if (ma_xa) {
    if (!BO_LOC.vung || BO_LOC.vung.ma !== ma_xa) {
      vua_dat_xa = dat_vung_loc_theo_xa(ma_xa);
    }
  } else if (BO_LOC.vung && BO_LOC.vung.kieu === 'xa') {
    xoa_vung_loc();
  }

  Object.keys(LOP).forEach(function (ma_lop) { ve_lop(ma_lop); });
  ve_lai_bang();

  var tong = 0, tong_tat_ca = 0;
  Object.keys(LOP).forEach(function (ma) {
    if (LOP[ma].loi) return;
    /* Lop mien loc vung luon hien du, cong vao chi lam con so kho hieu */
    if (BO_LOC.vung && LOP_MIEN_LOC_VUNG[ma]) return;
    tong += LOP[ma].so_hien || 0;
    tong_tat_ca += LOP[ma].doi_tuong.length;
  });

  var o_kq = document.getElementById('ket-qua-loc');
  if (!BO_LOC.ma_luu_vuc && !BO_LOC.tu_khoa && !BO_LOC.vung) {
    o_kq.textContent = '';
  } else {
    o_kq.textContent = (BO_LOC.vung ? 'Vùng lọc: ' + BO_LOC.vung.ten + '. ' : '')
                     + 'Còn ' + tong.toLocaleString('vi-VN') + ' trên tổng '
                     + tong_tat_ca.toLocaleString('vi-VN') + ' đối tượng.';
    if (BO_LOC.vung) {
      /* Cho mo lai hop tom tat sau khi da dong */
      var mo_lai = document.createElement('a');
      mo_lai.href = '#';
      mo_lai.textContent = ' Xem tóm tắt theo lớp';
      mo_lai.addEventListener('click', function (e) {
        e.preventDefault();
        hien_tom_tat_vung();
      });
      o_kq.appendChild(mo_lai);
    }
  }
  dong_chi_tiet();

  if (vua_dat_xa) {
    phong_den_vung_loc();
    hien_tom_tat_vung();
  }
}

function xoa_loc() {
  document.getElementById('loc-luu-vuc').value = '';
  document.getElementById('loc-tu-khoa').value = '';
  document.getElementById('loc-xa').value = '';
  xoa_vung_loc();
  ap_dung_loc();
}

/* --------------------------------------------------------------------------
   Chi muc tim kiem
   -------------------------------------------------------------------------- */
function dung_chi_muc_tim() {
  CHI_MUC_TIM = [];
  Object.keys(LOP).forEach(function (ma_lop) {
    var l = LOP[ma_lop];
    if (l.loi) return;
    var dn = l.dn;
    if (dn.khong_truy_van) return;
    l.doi_tuong.forEach(function (dt) {
      var ten = nhan_doi_tuong(ma_lop, dt.thuoc_tinh);
      CHI_MUC_TIM.push({
        ma_lop: ma_lop,
        ten_lop: dn.ten,
        chi_so: dt.chi_so,
        ten: ten,
        ten_khong_dau: bo_dau(ten),
        ma: dt.thuoc_tinh[dn.khoa] || '',
      });
    });
  });
}

function tim_kiem(tu_khoa) {
  var k = bo_dau(tu_khoa.trim());
  if (k.length < 2) return [];
  return CHI_MUC_TIM.filter(function (m) {
    return m.ten_khong_dau.indexOf(k) >= 0 || bo_dau(m.ma).indexOf(k) >= 0;
  }).slice(0, 25);
}

/* --------------------------------------------------------------------------
   Phong to den mot doi tuong va mo bang thong tin
   -------------------------------------------------------------------------- */
function di_den_doi_tuong(ma_lop, chi_so) {
  var l = LOP[ma_lop];
  if (!l) return;
  var dt = l.doi_tuong[chi_so];
  if (!dt) return;

  /* Bat lop neu dang tat, de nguoi dung thay duoc doi tuong */
  if (!l.hien) {
    var hop_chon = document.getElementById('chon-' + ma_lop);
    if (hop_chon) hop_chon.checked = true;
    dat_hien_lop(ma_lop, true);
  }

  var tam = tam_hinh_hoc(dt.hinh_hoc);
  /* Doi tuong khong co hinh hoc van nam trong bang thuoc tinh, vi du ao da bi
     boi lap trong danh muc ao ho khong duoc san lap. Chi mo hop thong tin,
     khong di chuyen ban do. */
  if (!dt.hinh_hoc) {
    hien_chi_tiet([{ ma_lop: ma_lop, chi_so: chi_so }], 0);
    return;
  }
  if (dt.hinh_hoc.type === 'Point') {
    ban_do.setView(tam, Math.max(ban_do.getZoom(), 13));
  } else if (dt.hinh) {
    var pv = dt.hinh.getBounds ? dt.hinh.getBounds() : null;
    if (pv && pv.isValid()) ban_do.fitBounds(pv, { padding: [50, 50], maxZoom: 14 });
    else ban_do.setView(tam, 13);
  } else {
    ban_do.setView(tam, 12);
  }

  hien_chi_tiet([{ ma_lop: ma_lop, chi_so: chi_so }], 0);
  nhay_sang_doi_tuong(dt);
}

/* Lam noi bat tam thoi mot doi tuong vua duoc chon */
var hinh_nhay_sang = null;

function nhay_sang_doi_tuong(dt) {
  if (hinh_nhay_sang) { nhom_ve_phu.removeLayer(hinh_nhay_sang); hinh_nhay_sang = null; }
  if (!dt || !dt.hinh_hoc) return;

  if (dt.hinh_hoc.type === 'Point') {
    hinh_nhay_sang = L.circleMarker(tam_hinh_hoc(dt.hinh_hoc), {
      radius: 16, color: '#f59e0b', weight: 3, fill: false, dashArray: '4 3',
    });
  } else {
    hinh_nhay_sang = L.geoJSON({ type: 'Feature', geometry: dt.hinh_hoc }, {
      style: { color: '#f59e0b', weight: 5, opacity: 0.9, fill: false },
    });
  }
  hinh_nhay_sang.addTo(nhom_ve_phu);
}

/* --------------------------------------------------------------------------
   Liet ke doi tuong trong mot vong ban kinh
   -------------------------------------------------------------------------- */
function liet_ke_trong_vong(tam, ban_kinh) {
  var ket_qua = [];

  Object.keys(LOP).forEach(function (ma_lop) {
    var l = LOP[ma_lop];
    if (l.loi || !l.hien || l.dn.khong_truy_van) return;
    l.doi_tuong.filter(qua_bo_loc).forEach(function (dt) {
      var tam_dt = tam_hinh_hoc(dt.hinh_hoc);
      if (!tam_dt) return;
      var kc = tam.distanceTo(tam_dt);
      if (kc <= ban_kinh) {
        ket_qua.push({
          ma_lop: ma_lop, ten_lop: l.dn.ten, chi_so: dt.chi_so,
          ten: nhan_doi_tuong(ma_lop, dt.thuoc_tinh), khoang_cach: kc,
        });
      }
    });
  });

  ket_qua.sort(function (a, b) { return a.khoang_cach - b.khoang_cach; });
  hien_ket_qua_vong(tam, ban_kinh, ket_qua);
}

function hien_ket_qua_vong(tam, ban_kinh, ket_qua) {
  if (ket_qua.length === 0) {
    mo_hop_thoai('Chọn theo bán kính',
      '<p class="ghi-chu-nho">Không có đối tượng nào thuộc các lớp đang bật '
      + 'trong bán kính ' + dinh_dang_khoang_cach(ban_kinh) + '.</p>');
    return;
  }

  /* Gom nhom theo lop de de doc */
  var theo_lop = {};
  ket_qua.forEach(function (r) {
    if (!theo_lop[r.ten_lop]) theo_lop[r.ten_lop] = [];
    theo_lop[r.ten_lop].push(r);
  });

  var html = '<p class="ghi-chu-nho">Tâm ' + tam.lat.toFixed(5) + '° B, '
           + tam.lng.toFixed(5) + '° Đ &middot; bán kính '
           + dinh_dang_khoang_cach(ban_kinh) + ' &middot; '
           + ket_qua.length + ' đối tượng.</p>';

  Object.keys(theo_lop).forEach(function (ten_lop) {
    html += '<div class="ct-khoi"><div class="ct-khoi__ten">' + ten_lop
          + ' (' + theo_lop[ten_lop].length + ')</div>'
          + '<table class="bang-thong-ke"><tbody>';
    theo_lop[ten_lop].forEach(function (r) {
      html += '<tr class="hang-ket-qua" data-lop="' + r.ma_lop
            + '" data-chi-so="' + r.chi_so + '" style="cursor:pointer">'
            + '<td>' + r.ten + '</td>'
            + '<td class="so">' + dinh_dang_khoang_cach(r.khoang_cach) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  });

  html += '<div class="ct-nut" style="margin-top:14px">'
        + '<button class="nut nut--chinh" id="xuat-ket-qua-vong">Xuất danh sách ra CSV</button>'
        + '</div>';

  mo_hop_thoai('Đối tượng trong bán kính', html);

  /* Nhap vao mot hang thi di den doi tuong do */
  var cac_hang = document.querySelectorAll('#hop-thoai-than .hang-ket-qua');
  for (var i = 0; i < cac_hang.length; i++) {
    cac_hang[i].addEventListener('click', function () {
      dong_hop_thoai();
      di_den_doi_tuong(this.dataset.lop, Number(this.dataset.chiSo));
    });
  }

  document.getElementById('xuat-ket-qua-vong')
    .addEventListener('click', function () {
      var cot = ['ten_lop', 'ma_doi_tuong', 'ten_doi_tuong', 'khoang_cach_m'];
      var hang = ket_qua.map(function (r) {
        var dt = LOP[r.ma_lop].doi_tuong[r.chi_so];
        return [r.ten_lop, dt.thuoc_tinh[LOP[r.ma_lop].dn.khoa] || '',
                r.ten, Math.round(r.khoang_cach)];
      });
      tai_ve_csv('doi_tuong_trong_ban_kinh.csv', cot, hang);
    });
}

/* --------------------------------------------------------------------------
   Tam hinh hoc cua mot feature, dung chung nhieu noi
   -------------------------------------------------------------------------- */
function tam_hinh_hoc(hh) {
  if (!hh) return null;
  var cac_diem = [];
  thu_thap_toa_do(hh.coordinates, cac_diem);
  if (cac_diem.length === 0) return null;
  var tong_lat = 0, tong_lng = 0;
  cac_diem.forEach(function (p) { tong_lng += p[0]; tong_lat += p[1]; });
  return L.latLng(tong_lat / cac_diem.length, tong_lng / cac_diem.length);
}

/* De quy lay moi cap toa do trong mot cau truc coordinates bat ky */
function thu_thap_toa_do(toa_do, ket_qua) {
  if (!Array.isArray(toa_do)) return;
  if (typeof toa_do[0] === 'number') { ket_qua.push(toa_do); return; }
  for (var i = 0; i < toa_do.length; i++) thu_thap_toa_do(toa_do[i], ket_qua);
}
