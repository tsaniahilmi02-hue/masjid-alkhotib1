const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const LOGIN_KEY = 'adminLoggedIn';
const DATA_KEYS = {
    kegiatan: 'masjidKegiatanData',
    program: 'masjidProgramData',
    berita: 'masjidBeritaData',
    galeri: 'masjidGaleriData',
    pengurus: 'masjidPengurusData',
    inventaris: 'masjidInventarisData',
    donasi: 'masjidDonasiData',
    pemasukan: 'masjidPemasukanData',
    pengeluaran: 'masjidPengeluaranData'
};

let editIds = { kegiatan: null, program: null, berita: null, galeri: null, pengurus: null, inventaris: null, donasi: null, pemasukan: null, pengeluaran: null };

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) initLogin();
    if (document.getElementById('sidebar')) initAdminPage();
});

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem(LOGIN_KEY, 'true');
            window.location.href = 'admin.html';
        } else {
            document.getElementById('errorMsg').style.display = 'block';
            showNotification('Username atau password salah!', 'error');
        }
    });
}

function initAdminPage() {
    if (localStorage.getItem(LOGIN_KEY) !== 'true') {
        window.location.href = 'loginadmin.html';
        return;
    }
    initSidebar();
    initNavigation();
    initAllModals();
    initAllButtons();
    loadAllTables();
    updateDashboard();
    initLogout();
}

function initSidebar() {
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
}

function initNavigation() {
    document.querySelectorAll('.sidebar-nav .nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            openPage(page);
            document.querySelectorAll('.sidebar-nav .nav-link[data-page]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function openPage(pageKey) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageKey)?.classList.add('active');
    const titles = {
        dashboard: 'Dashboard', kegiatan: 'Kelola Kegiatan', program: 'Kelola Program & Kajian Rutin', berita: 'Kelola Berita',
        galeri: 'Kelola Galeri', pengurus: 'Kelola Pengurus', inventaris: 'Inventaris', donasi: 'Donasi & Infaq',
        pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran', laporan: 'Laporan Keuangan'
    };
    document.getElementById('pageTitle').textContent = titles[pageKey] || 'Dashboard';
    if (pageKey === 'laporan') updateLaporan();
}

function initAllModals() {
    document.querySelectorAll('.modal .close-modal').forEach(btn => {
        btn.addEventListener('click', function() { this.closest('.modal').classList.remove('active'); });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('active');
        });
    });
}

function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

function initAllButtons() {
    document.getElementById('addKegiatanBtn')?.addEventListener('click', () => openAddModal('kegiatan'));
    document.getElementById('kegiatanForm')?.addEventListener('submit', (e) => { e.preventDefault(); saveKegiatan(); });
    document.getElementById('addProgramBtn')?.addEventListener('click', () => openAddModal('program'));
    document.getElementById('programForm')?.addEventListener('submit', (e) => { e.preventDefault(); saveProgram(); });
    document.getElementById('addBeritaBtn')?.addEventListener('click', () => openAddModal('berita'));
    document.getElementById('beritaForm')?.addEventListener('submit', (e) => { e.preventDefault(); saveBerita(); });
    document.getElementById('addGaleriBtn')?.addEventListener('click', () => openAddModal('galeri'));
    document.getElementById('galeriForm')?.addEventListener('submit', (e) => { e.preventDefault(); saveGaleri(); });
    document.getElementById('addPengurusBtn')?.addEventListener('click', () => openAddModal('pengurus'));
    document.getElementById('pengurusForm')?.addEventListener('submit', (e) => { e.preventDefault(); savePengurus(); });
    document.getElementById('addInventarisBtn')?.addEventListener('click', () => openAddModal('inventaris'));
    document.getElementById('inventarisForm')?.addEventListener('submit', (e) => { e.preventDefault(); saveInventaris(); });
    document.getElementById('exportInventarisPdfBtn')?.addEventListener('click', exportInventarisPdf);
    document.getElementById('addDonasiBtn')?.addEventListener('click', () => openAddModal('donasi'));
    document.getElementById('donasiForm')?.addEventListener('submit', (e) => { e.preventDefault(); saveDonasi(); });
    document.getElementById('addPemasukanBtn')?.addEventListener('click', () => openAddModal('pemasukan'));
    document.getElementById('pemasukanForm')?.addEventListener('submit', (e) => { e.preventDefault(); savePemasukan(); });
    document.getElementById('addPengeluaranBtn')?.addEventListener('click', () => openAddModal('pengeluaran'));
    document.getElementById('pengeluaranForm')?.addEventListener('submit', (e) => { e.preventDefault(); savePengeluaran(); });
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportPdf);
}

function openAddModal(type) {
    editIds[type] = null;
    const form = document.getElementById(type + 'Form');
    if (form) form.reset();
    const modalTitle = document.getElementById(type + 'ModalTitle');
    if (modalTitle) modalTitle.textContent = 'Tambah ' + type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById(type + 'Modal').classList.add('active');
}

function saveKegiatan() {
    const name = document.getElementById('kegiatanName').value.trim();
    const desc = document.getElementById('kegiatanDesc').value.trim();
    const jadwal = document.getElementById('kegiatanJadwal').value.trim();
    const tempat = document.getElementById('kegiatanTempat').value.trim();
    if (!name || !desc || !jadwal || !tempat) { showNotification('Lengkapi semua field', 'error'); return; }
    
    let data = loadData('kegiatan');
    const item = { id: editIds.kegiatan || Date.now(), name, desc, jadwal, tempat };
    if (editIds.kegiatan) {
        data = data.map(d => d.id === editIds.kegiatan ? item : d);
        showNotification('Kegiatan berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Kegiatan berhasil ditambahkan', 'success');
    }
    saveData('kegiatan', data);
    closeModal('kegiatanModal');
    renderTable('kegiatan');
    updateDashboard();
}

function editKegiatan(id) {
    const data = loadData('kegiatan');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.kegiatan = id;
    document.getElementById('kegiatanName').value = item.name;
    document.getElementById('kegiatanDesc').value = item.desc;
    document.getElementById('kegiatanJadwal').value = item.jadwal;
    document.getElementById('kegiatanTempat').value = item.tempat;
    document.getElementById('kegiatanModalTitle').textContent = 'Edit Kegiatan';
    document.getElementById('kegiatanModal').classList.add('active');
}

function deleteKegiatan(id) {
    if (!confirm('Hapus kegiatan ini?')) return;
    const data = loadData('kegiatan').filter(d => d.id !== id);
    saveData('kegiatan', data);
    showNotification('Kegiatan berhasil dihapus', 'success');
    renderTable('kegiatan');
}

function saveProgram() {
    const nama = document.getElementById('programNama').value.trim();
    const desc = document.getElementById('programDesc').value.trim();
    const tipe = document.getElementById('programTipe').value;
    const jadwal = document.getElementById('programJadwal').value.trim();
    const tempat = document.getElementById('programTempat').value.trim();
    const ustadz = document.getElementById('programUstadz').value.trim();
    const icon = document.getElementById('programIcon').value.trim();
    
    if (!nama || !desc || !tipe || !jadwal || !tempat || !ustadz) { 
        showNotification('Lengkapi semua field wajib', 'error'); 
        return; 
    }
    
    let data = loadData('program');
    const item = { id: editIds.program || Date.now(), nama, desc, tipe, jadwal, tempat, ustadz, icon: icon || 'fas fa-mosque' };
    
    if (editIds.program) {
        data = data.map(d => d.id === editIds.program ? item : d);
        showNotification('Program berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Program berhasil ditambahkan', 'success');
    }
    
    saveData('program', data);
    closeModal('programModal');
    renderTable('program');
    updateDashboard();
}

function editProgram(id) {
    const data = loadData('program');
    const item = data.find(d => d.id === id);
    if (!item) return;
    
    editIds.program = id;
    document.getElementById('programNama').value = item.nama;
    document.getElementById('programDesc').value = item.desc;
    document.getElementById('programTipe').value = item.tipe;
    document.getElementById('programJadwal').value = item.jadwal;
    document.getElementById('programTempat').value = item.tempat;
    document.getElementById('programUstadz').value = item.ustadz;
    document.getElementById('programIcon').value = item.icon;
    document.getElementById('programModalTitle').textContent = 'Edit Program';
    document.getElementById('programModal').classList.add('active');
}

function deleteProgram(id) {
    if (!confirm('Hapus program ini?')) return;
    const data = loadData('program').filter(d => d.id !== id);
    saveData('program', data);
    showNotification('Program berhasil dihapus', 'success');
    renderTable('program');
    updateDashboard();
}

function saveBerita() {
    const judul = document.getElementById('beritaJudul').value.trim();
    const isi = document.getElementById('beritaIsi').value.trim();
    const fotoFile = document.getElementById('beritaFoto').files[0];
    const kategori = document.getElementById('beritaKategori').value;
    const tanggal = document.getElementById('beritaTanggal').value;
    if (!judul || !isi || !kategori || !tanggal) { showNotification('Lengkapi semua field', 'error'); return; }
    
    const saveItem = (fotoUrl) => {
        let data = loadData('berita');
        const item = { id: editIds.berita || Date.now(), judul, isi, foto: fotoUrl, kategori, tanggal };
        if (editIds.berita) {
            data = data.map(d => d.id === editIds.berita ? item : d);
            showNotification('Berita berhasil diupdate', 'success');
        } else {
            data.push(item);
            showNotification('Berita berhasil ditambahkan', 'success');
        }
        saveData('berita', data);
        closeModal('beritaModal');
        renderTable('berita');
        updateDashboard();
    };
    
    if (fotoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveItem(e.target.result);
        };
        reader.readAsDataURL(fotoFile);
    } else {
        saveItem('');
    }
}

function editBerita(id) {
    const data = loadData('berita');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.berita = id;
    document.getElementById('beritaJudul').value = item.judul;
    document.getElementById('beritaIsi').value = item.isi;
    // Note: File input can't be pre-filled, user needs to re-upload if changing photo
    document.getElementById('beritaKategori').value = item.kategori;
    document.getElementById('beritaTanggal').value = item.tanggal;
    document.getElementById('beritaModalTitle').textContent = 'Edit Berita';
    document.getElementById('beritaModal').classList.add('active');
}

function deleteBerita(id) {
    if (!confirm('Hapus berita ini?')) return;
    const data = loadData('berita').filter(d => d.id !== id);
    saveData('berita', data);
    showNotification('Berita berhasil dihapus', 'success');
    renderTable('berita');
}

function saveGaleri() {
    const judul = document.getElementById('galeriJudul').value.trim();
    const deskripsi = document.getElementById('galeriDeskripsi').value.trim();
    const foto = document.getElementById('galeriFoto').files[0];
    const tanggal = document.getElementById('galeriTanggal').value;
    if (!judul || !deskripsi || !foto || !tanggal) { showNotification('Lengkapi semua field', 'error'); return; }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fotoUrl = e.target.result;
        let data = loadData('galeri');
        const item = { id: editIds.galeri || Date.now(), judul, deskripsi, foto: fotoUrl, tanggal };
        if (editIds.galeri) {
            data = data.map(d => d.id === editIds.galeri ? item : d);
            showNotification('Foto galeri berhasil diupdate', 'success');
        } else {
            data.push(item);
            showNotification('Foto galeri berhasil ditambahkan', 'success');
        }
        saveData('galeri', data);
        closeModal('galeriModal');
        renderTable('galeri');
        updateDashboard();
    };
    reader.readAsDataURL(foto);
}

function editGaleri(id) {
    const data = loadData('galeri');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.galeri = id;
    document.getElementById('galeriJudul').value = item.judul;
    document.getElementById('galeriDeskripsi').value = item.deskripsi;
    // Note: File input can't be pre-filled, user needs to re-upload
    document.getElementById('galeriTanggal').value = item.tanggal;
    document.getElementById('galeriModalTitle').textContent = 'Edit Foto Galeri';
    document.getElementById('galeriModal').classList.add('active');
}

function deleteGaleri(id) {
    if (!confirm('Hapus foto galeri ini?')) return;
    const data = loadData('galeri').filter(d => d.id !== id);
    saveData('galeri', data);
    showNotification('Foto galeri berhasil dihapus', 'success');
    renderTable('galeri');
}

function savePengurus() {
    const nama = document.getElementById('pengurusNama').value.trim();
    const jabatan = document.getElementById('pengurusJabatan').value.trim();
    const kontak = document.getElementById('pengurusKontak').value.trim();
    if (!nama || !jabatan) { showNotification('Lengkapi field wajib', 'error'); return; }
    
    let data = loadData('pengurus');
    const item = { id: editIds.pengurus || Date.now(), nama, jabatan, kontak };
    if (editIds.pengurus) {
        data = data.map(d => d.id === editIds.pengurus ? item : d);
        showNotification('Pengurus berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Pengurus berhasil ditambahkan', 'success');
    }
    saveData('pengurus', data);
    closeModal('pengurusModal');
    renderTable('pengurus');
}

function editPengurus(id) {
    const data = loadData('pengurus');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.pengurus = id;
    document.getElementById('pengurusNama').value = item.nama;
    document.getElementById('pengurusJabatan').value = item.jabatan;
    document.getElementById('pengurusKontak').value = item.kontak;
    document.getElementById('pengurusModalTitle').textContent = 'Edit Pengurus';
    document.getElementById('pengurusModal').classList.add('active');
}

function deletePengurus(id) {
    if (!confirm('Hapus pengurus ini?')) return;
    const data = loadData('pengurus').filter(d => d.id !== id);
    saveData('pengurus', data);
    showNotification('Pengurus berhasil dihapus', 'success');
    renderTable('pengurus');
}

function saveInventaris() {
    const nama = document.getElementById('inventarisNama').value.trim();
    const jumlah = parseInt(document.getElementById('inventarisJumlah').value);
    const kondisi = document.getElementById('inventarisKondisi').value;
    const lokasi = document.getElementById('inventarisLokasi').value.trim();
    if (!nama || !jumlah || !kondisi || !lokasi) { showNotification('Lengkapi semua field', 'error'); return; }
    
    let data = loadData('inventaris');
    const item = { id: editIds.inventaris || Date.now(), nama, jumlah, kondisi, lokasi };
    if (editIds.inventaris) {
        data = data.map(d => d.id === editIds.inventaris ? item : d);
        showNotification('Barang berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Barang berhasil ditambahkan', 'success');
    }
    saveData('inventaris', data);
    closeModal('inventarisModal');
    renderTable('inventaris');
}

function editInventaris(id) {
    const data = loadData('inventaris');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.inventaris = id;
    document.getElementById('inventarisNama').value = item.nama;
    document.getElementById('inventarisJumlah').value = item.jumlah;
    document.getElementById('inventarisKondisi').value = item.kondisi;
    document.getElementById('inventarisLokasi').value = item.lokasi;
    document.getElementById('inventarisModalTitle').textContent = 'Edit Barang';
    document.getElementById('inventarisModal').classList.add('active');
}

function deleteInventaris(id) {
    if (!confirm('Hapus barang ini?')) return;
    const data = loadData('inventaris').filter(d => d.id !== id);
    saveData('inventaris', data);
    showNotification('Barang berhasil dihapus', 'success');
    renderTable('inventaris');
}

function saveDonasi() {
    const nama = document.getElementById('donasiNama').value.trim();
    const nominal = parseInt(document.getElementById('donasiNominal').value);
    const tanggal = document.getElementById('donasiTanggal').value;
    const keterangan = document.getElementById('donasiKeterangan').value.trim();
    if (!nama || !nominal || !tanggal) { showNotification('Lengkapi field wajib', 'error'); return; }
    
    let data = loadData('donasi');
    const item = { id: editIds.donasi || Date.now(), nama, nominal, tanggal, keterangan };
    if (editIds.donasi) {
        data = data.map(d => d.id === editIds.donasi ? item : d);
        showNotification('Donasi berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Donasi berhasil dicatat', 'success');
    }
    saveData('donasi', data);
    closeModal('donasiModal');
    renderTable('donasi');
    updateDashboard();
}

function editDonasi(id) {
    const data = loadData('donasi');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.donasi = id;
    document.getElementById('donasiNama').value = item.nama;
    document.getElementById('donasiNominal').value = item.nominal;
    document.getElementById('donasiTanggal').value = item.tanggal;
    document.getElementById('donasiKeterangan').value = item.keterangan;
    document.getElementById('donasiModalTitle').textContent = 'Edit Donasi';
    document.getElementById('donasiModal').classList.add('active');
}

function deleteDonasi(id) {
    if (!confirm('Hapus donasi ini?')) return;
    const data = loadData('donasi').filter(d => d.id !== id);
    saveData('donasi', data);
    showNotification('Donasi berhasil dihapus', 'success');
    renderTable('donasi');
    updateDashboard();
}

function savePemasukan() {
    const kategori = document.getElementById('pemasukanKategori').value;
    const nominal = parseInt(document.getElementById('pemasukanNominal').value);
    const tanggal = document.getElementById('pemasukanTanggal').value;
    const keterangan = document.getElementById('pemasukanKeterangan').value.trim();
    if (!kategori || !nominal || !tanggal) { showNotification('Lengkapi field wajib', 'error'); return; }
    
    let data = loadData('pemasukan');
    const item = { id: editIds.pemasukan || Date.now(), kategori, nominal, tanggal, keterangan, tipe: 'Pemasukan' };
    if (editIds.pemasukan) {
        data = data.map(d => d.id === editIds.pemasukan ? item : d);
        showNotification('Pemasukan berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Pemasukan berhasil dicatat', 'success');
    }
    saveData('pemasukan', data);
    closeModal('pemasukanModal');
    renderTable('pemasukan');
    updateDashboard();
}

function editPemasukan(id) {
    const data = loadData('pemasukan');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.pemasukan = id;
    document.getElementById('pemasukanKategori').value = item.kategori;
    document.getElementById('pemasukanNominal').value = item.nominal;
    document.getElementById('pemasukanTanggal').value = item.tanggal;
    document.getElementById('pemasukanKeterangan').value = item.keterangan;
    document.getElementById('pemasukanModalTitle').textContent = 'Edit Pemasukan';
    document.getElementById('pemasukanModal').classList.add('active');
}

function deletePemasukan(id) {
    if (!confirm('Hapus pemasukan ini?')) return;
    const data = loadData('pemasukan').filter(d => d.id !== id);
    saveData('pemasukan', data);
    showNotification('Pemasukan berhasil dihapus', 'success');
    renderTable('pemasukan');
    updateDashboard();
}

function savePengeluaran() {
    const kategori = document.getElementById('pengeluaranKategori').value;
    const nominal = parseInt(document.getElementById('pengeluaranNominal').value);
    const tanggal = document.getElementById('pengeluaranTanggal').value;
    const keterangan = document.getElementById('pengeluaranKeterangan').value.trim();
    if (!kategori || !nominal || !tanggal) { showNotification('Lengkapi field wajib', 'error'); return; }
    
    let data = loadData('pengeluaran');
    const item = { id: editIds.pengeluaran || Date.now(), kategori, nominal, tanggal, keterangan, tipe: 'Pengeluaran' };
    if (editIds.pengeluaran) {
        data = data.map(d => d.id === editIds.pengeluaran ? item : d);
        showNotification('Pengeluaran berhasil diupdate', 'success');
    } else {
        data.push(item);
        showNotification('Pengeluaran berhasil dicatat', 'success');
    }
    saveData('pengeluaran', data);
    closeModal('pengeluaranModal');
    renderTable('pengeluaran');
    updateDashboard();
}

function editPengeluaran(id) {
    const data = loadData('pengeluaran');
    const item = data.find(d => d.id === id);
    if (!item) return;
    editIds.pengeluaran = id;
    document.getElementById('pengeluaranKategori').value = item.kategori;
    document.getElementById('pengeluaranNominal').value = item.nominal;
    document.getElementById('pengeluaranTanggal').value = item.tanggal;
    document.getElementById('pengeluaranKeterangan').value = item.keterangan;
    document.getElementById('pengeluaranModalTitle').textContent = 'Edit Pengeluaran';
    document.getElementById('pengeluaranModal').classList.add('active');
}

function deletePengeluaran(id) {
    if (!confirm('Hapus pengeluaran ini?')) return;
    const data = loadData('pengeluaran').filter(d => d.id !== id);
    saveData('pengeluaran', data);
    showNotification('Pengeluaran berhasil dihapus', 'success');
    renderTable('pengeluaran');
    updateDashboard();
}

function renderTable(type) {
    const data = loadData(type);
    const tbody = document.getElementById(type + 'TableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;">Belum ada data</td></tr>';
        return;
    }
    data.forEach((item, idx) => {
        let row = '';
        if (type === 'kegiatan') {
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.name + '</td><td>' + item.jadwal + '</td><td>' + item.tempat + '</td><td>' + 
                  '<button class="btn-icon" onclick="editKegiatan(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deleteKegiatan(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'program') {
            const tipeLabel = item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1);
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.nama + '</td><td><span class="status">' + tipeLabel + '</span></td><td>' + item.jadwal + '</td><td>' + item.ustadz + '</td><td>' + 
                  '<button class="btn-icon" onclick="editProgram(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deleteProgram(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'berita') {
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.judul + '</td><td>' + item.kategori + '</td><td>' + item.tanggal + '</td><td>' + 
                  '<button class="btn-icon" onclick="editBerita(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deleteBerita(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'galeri') {
            row = '<tr><td>' + (idx + 1) + '</td><td><img src="' + item.foto + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;"></td><td>' + item.judul + '</td><td>' + item.deskripsi.substring(0,50) + '...</td><td>' + item.tanggal + '</td><td>' + 
                  '<button class="btn-icon" onclick="editGaleri(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deleteGaleri(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'pengurus') {
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.nama + '</td><td>' + item.jabatan + '</td><td>' + (item.kontak || '-') + '</td><td>' + 
                  '<button class="btn-icon" onclick="editPengurus(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deletePengurus(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'inventaris') {
            var statusClass = item.kondisi === 'Baik' ? 'success' : 'warning';
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.nama + '</td><td>' + item.jumlah + '</td><td><span class="status ' + statusClass + '">' + item.kondisi + '</span></td><td>' + item.lokasi + '</td><td>' + 
                  '<button class="btn-icon" onclick="editInventaris(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deleteInventaris(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'donasi') {
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.nama + '</td><td>Rp ' + formatCurrency(item.nominal) + '</td><td>' + item.tanggal + '</td><td>' + (item.keterangan || '-') + '</td><td>' + 
                  '<button class="btn-icon" onclick="editDonasi(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deleteDonasi(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'pemasukan') {
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.kategori + '</td><td>Rp ' + formatCurrency(item.nominal) + '</td><td>' + item.tanggal + '</td><td>' + (item.keterangan || '-') + '</td><td>' + 
                  '<button class="btn-icon" onclick="editPemasukan(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deletePemasukan(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        else if (type === 'pengeluaran') {
            row = '<tr><td>' + (idx + 1) + '</td><td>' + item.kategori + '</td><td>Rp ' + formatCurrency(item.nominal) + '</td><td>' + item.tanggal + '</td><td>' + (item.keterangan || '-') + '</td><td>' + 
                  '<button class="btn-icon" onclick="editPengeluaran(' + item.id + ')"><i class="fas fa-edit"></i></button>' + 
                  '<button class="btn-icon" onclick="deletePengeluaran(' + item.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        tbody.innerHTML += row;
    });
}

function loadAllTables() {
    Object.keys(DATA_KEYS).forEach(type => renderTable(type));
}

function updateDashboard() {
    const berita = loadData('berita');
    const kegiatan = loadData('kegiatan');
    const program = loadData('program');
    const donasi = loadData('donasi');
    const pemasukan = loadData('pemasukan');
    const pengeluaran = loadData('pengeluaran');
    document.getElementById('statBerita').textContent = berita.length;
    document.getElementById('statKegiatan').textContent = kegiatan.length + program.length;
    const totalPemasukan = pemasukan.reduce((a, b) => a + (b.nominal || 0), 0);
    document.getElementById('statPemasukan').textContent = 'Rp ' + formatCurrency(totalPemasukan);
    const totalPengeluaran = pengeluaran.reduce((a, b) => a + (b.nominal || 0), 0);
    document.getElementById('statPengeluaran').textContent = 'Rp ' + formatCurrency(totalPengeluaran);
    const saldo = totalPemasukan - totalPengeluaran;
    document.getElementById('statSaldo').textContent = 'Rp ' + formatCurrency(saldo);
}

function updateLaporan() {
    const pemasukan = loadData('pemasukan');
    const pengeluaran = loadData('pengeluaran');
    const totalMasuk = pemasukan.reduce((a, b) => a + (b.nominal || 0), 0);
    const totalKeluar = pengeluaran.reduce((a, b) => a + (b.nominal || 0), 0);
    const saldo = totalMasuk - totalKeluar;
    document.getElementById('totalPemasukan').textContent = 'Rp ' + formatCurrency(totalMasuk);
    document.getElementById('totalPengeluaran').textContent = 'Rp ' + formatCurrency(totalKeluar);
    document.getElementById('saldoAkhir').textContent = 'Rp ' + formatCurrency(saldo);
    const tbody = document.getElementById('laporanTableBody');
    tbody.innerHTML = '';
    const combined = [...pemasukan.map(p => ({ ...p, tipe: 'Pemasukan' })), ...pengeluaran.map(p => ({ ...p, tipe: 'Pengeluaran' }))].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    combined.forEach(item => {
        const row = document.createElement('tr');
        const warna = item.tipe === 'Pemasukan' ? 'success' : 'danger';
        row.innerHTML = `<td>${item.tanggal || ''}</td><td><span class="status ${warna}">${item.tipe}</span></td><td>${item.kategori || ''}</td><td>Rp ${formatCurrency(item.nominal || 0)}</td><td>${item.keterangan || ''}</td>`;
        tbody.appendChild(row);
    });
}

function exportPdf() {
    const pemasukan = loadData('pemasukan');
    const pengeluaran = loadData('pengeluaran');

    // Gabungkan dan sort berdasarkan tanggal
    const allTransactions = [
        ...pemasukan.map(item => ({ ...item, type: 'Pemasukan', debit: item.nominal, kredit: 0 })),
        ...pengeluaran.map(item => ({ ...item, type: 'Pengeluaran', debit: 0, kredit: item.nominal }))
    ].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    // Hitung saldo berjalan
    let saldoBerjalan = 0;
    allTransactions.forEach(item => {
        saldoBerjalan += item.debit - item.kredit;
        item.saldo = saldoBerjalan;
    });

    const totalMasuk = pemasukan.reduce((a, b) => a + (b.nominal || 0), 0);
    const totalKeluar = pengeluaran.reduce((a, b) => a + (b.nominal || 0), 0);
    const saldoAkhir = totalMasuk - totalKeluar;

    // Buat tabel transaksi atau pesan jika kosong
    let tableRows = '';
    if (allTransactions.length === 0) {
        tableRows = `<tr><td colspan="5" style="padding:12px;text-align:center;color:#999;">Belum ada data transaksi</td></tr>`;
    } else {
        tableRows = allTransactions.map(item => `
            <tr>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px">${item.tanggal}</td>
                <td style="padding:8px;border:1px solid #ddd;font-size:11px">${item.keterangan || item.kategori || ''}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px">${item.debit ? 'Rp ' + formatCurrency(item.debit) : '-'}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px">${item.kredit ? 'Rp ' + formatCurrency(item.kredit) : '-'}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:11px">Rp ${formatCurrency(item.saldo)}</td>
            </tr>
        `).join('');
    }

    const htmlContent = `
        <div style="font-family:Arial, sans-serif;padding:20px;max-width:900px;margin:0 auto;">
            <h1 style="text-align:center;color:#2d8a5e;margin-bottom:5px">LAPORAN KEUANGAN</h1>
            <h3 style="text-align:center;color:#666;margin:0 0 3px 0">Masjid Al-Khotib Kediri</h3>
            <p style="text-align:center;margin:0 0 20px 0;font-size:12px;color:#999;">Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>

            <h3 style="color:#2d8a5e;border-bottom:2px solid #c9993a;padding-bottom:8px;margin:20px 0 15px 0;font-size:14px">Ringkasan Keuangan</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:30px;border:1px solid #ddd;">
                <tr style="background:#f8f9fa;">
                    <td style="padding:12px;border:1px solid #ddd;font-weight:bold">Total Pemasukan</td>
                    <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;color:#2d8a5e;">Rp ${formatCurrency(totalMasuk)}</td>
                </tr>
                <tr>
                    <td style="padding:12px;border:1px solid #ddd;font-weight:bold">Total Pengeluaran</td>
                    <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;color:#dc2626;">Rp ${formatCurrency(totalKeluar)}</td>
                </tr>
                <tr style="background:#e8f5e9;">
                    <td style="padding:12px;border:1px solid #ddd;font-weight:bold">Saldo Akhir</td>
                    <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;color:#c9993a;">Rp ${formatCurrency(saldoAkhir)}</td>
                </tr>
            </table>

            <h3 style="color:#2d8a5e;border-bottom:2px solid #c9993a;padding-bottom:8px;margin:20px 0 15px 0;font-size:14px">Detail Transaksi</h3>
            <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;font-size:11px;">
                <thead>
                    <tr style="background:#2d8a5e;color:white;">
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Tanggal</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Keterangan</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Debit (Masuk)</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Kredit (Keluar)</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div style="margin-top:30px;padding:15px;background:#f8f9fa;border-radius:8px;border-left:3px solid #c9993a;">
                <p style="margin:0;text-align:center;font-style:italic;color:#666;font-size:11px;">
                    Laporan ini dibuat secara otomatis pada ${new Date().toLocaleString('id-ID')}
                </p>
            </div>
        </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const opt = { margin: 10, filename: `laporan-keuangan-${new Date().toISOString().split('T')[0]}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' } };
    html2pdf().set(opt).from(element).save();
    showNotification('PDF berhasil didownload', 'success');
}

function exportInventarisPdf() {
    const inventaris = loadData('inventaris');

    let tableRows = '';
    if (inventaris.length === 0) {
        tableRows = `<tr><td colspan="4" style="padding:12px;text-align:center;color:#999;">Belum ada data inventaris</td></tr>`;
    } else {
        tableRows = inventaris.map((item, index) => `
            <tr>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px">${index + 1}</td>
                <td style="padding:8px;border:1px solid #ddd;font-size:11px">${item.nama}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px">${item.jumlah}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;font-size:11px">${item.kondisi}</td>
                <td style="padding:8px;border:1px solid #ddd;font-size:11px">${item.lokasi}</td>
            </tr>
        `).join('');
    }

    const htmlContent = `
        <div style="font-family:Arial, sans-serif;padding:20px;max-width:900px;margin:0 auto;">
            <h1 style="text-align:center;color:#2d8a5e;margin-bottom:5px">LAPORAN INVENTARIS</h1>
            <h3 style="text-align:center;color:#666;margin:0 0 3px 0">Masjid Al-Khotib Kediri</h3>
            <p style="text-align:center;margin:0 0 20px 0;font-size:12px;color:#999;">Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>

            <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;font-size:11px;">
                <thead>
                    <tr style="background:#2d8a5e;color:white;">
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">No</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Nama Barang</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Jumlah</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Kondisi</th>
                        <th style="padding:10px;border:1px solid #ddd;text-align:center;font-size:12px">Lokasi</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div style="margin-top:30px;padding:15px;background:#f8f9fa;border-radius:8px;border-left:3px solid #c9993a;">
                <p style="margin:0;text-align:center;font-style:italic;color:#666;font-size:11px;">
                    Laporan ini dibuat secara otomatis pada ${new Date().toLocaleString('id-ID')}
                </p>
            </div>
        </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const opt = { margin: 10, filename: `laporan-inventaris-${new Date().toISOString().split('T')[0]}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' } };
    html2pdf().set(opt).from(element).save();
    showNotification('PDF inventaris berhasil didownload', 'success');
}

function loadData(type) {
    const raw = localStorage.getItem(DATA_KEYS[type]);
    return raw ? JSON.parse(raw) : [];
}

function saveData(type, data) {
    localStorage.setItem(DATA_KEYS[type], JSON.stringify(data));
}

function formatCurrency(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 50);
    setTimeout(() => notif.classList.remove('show'), 2500);
    setTimeout(() => notif.remove(), 3000);
}

function initLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(LOGIN_KEY);
        window.location.href = 'loginadmin.html';
    });
}
