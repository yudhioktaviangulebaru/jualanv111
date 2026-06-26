import type { ComponentType } from 'preact';
import { useEffect } from 'preact/hooks';
import { LocationProvider, Router, Route, useLocation } from 'preact-iso';
import { ThemeProvider } from './theme/ThemeProvider';
import { ToastProvider } from './components/toast/ToastProvider';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { RequireAccess } from './auth/RequireAccess';
import { DashboardLayout } from './components/DashboardLayout';
import { NAV_ITEMS } from './config/nav';
import { normalizeRole, can, canViewMenu } from './auth/permissions';
import type { Menu, Action } from './auth/permissions';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProdukList } from './pages/produk/ProdukList';
import { ProdukCreate } from './pages/produk/ProdukCreate';
import { ProdukView } from './pages/produk/ProdukView';
import { ProdukEdit } from './pages/produk/ProdukEdit';
import { ProdukDelete } from './pages/produk/ProdukDelete';
import { GudangList } from './pages/gudang/GudangList';
import { GudangCreate } from './pages/gudang/GudangCreate';
import { GudangView } from './pages/gudang/GudangView';
import { GudangEdit } from './pages/gudang/GudangEdit';
import { GudangDelete } from './pages/gudang/GudangDelete';
import { StockInList } from './pages/stockin/StockInList';
import { StockInCreate } from './pages/stockin/StockInCreate';
import { StockInView } from './pages/stockin/StockInView';
import { TransactionList } from './pages/transaksi/TransactionList';
import { TransactionCreate } from './pages/transaksi/TransactionCreate';
import { TransactionView } from './pages/transaksi/TransactionView';
import { TransactionDelete } from './pages/transaksi/TransactionDelete';
import { PenggunaList } from './pages/pengguna/PenggunaList';
import { PenggunaCreate } from './pages/pengguna/PenggunaCreate';
import { PenggunaView } from './pages/pengguna/PenggunaView';
import { LaporanKasir } from './pages/laporan/LaporanKasir';
import { NoAccess } from './pages/NoAccess';
import { NotFound } from './pages/NotFound';

interface Access {
  menu: Menu;
  action?: Action;
}

/**
 * Bungkus halaman dengan guard auth + shell dashboard. Bila `access` diberikan,
 * tambahkan pula guard hak akses berbasis role. Props route diteruskan.
 */
function protectedPage<P extends Record<string, unknown>>(
  Page: ComponentType<P>,
  access?: Access,
) {
  return (props: P) => (
    <RequireAuth>
      <DashboardLayout>
        {access ? (
          <RequireAccess menu={access.menu} action={access.action}>
            <Page {...props} />
          </RequireAccess>
        ) : (
          <Page {...props} />
        )}
      </DashboardLayout>
    </RequireAuth>
  );
}

/**
 * Landing `/`. Admin melihat Dashboard; role lain diarahkan ke menu pertama
 * yang boleh diakses; guest (tanpa akses) melihat NoAccess.
 */
function Home() {
  const { user } = useAuth();
  const { route } = useLocation();
  const role = normalizeRole(user?.role);
  const showDashboard = can(role, 'dashboard', 'view');
  const fallback = NAV_ITEMS.find(
    (i) => i.menu !== 'dashboard' && canViewMenu(role, i.menu),
  );

  useEffect(() => {
    if (!showDashboard && fallback) route(fallback.path, true);
  }, [showDashboard, fallback?.path]);

  if (showDashboard) return <Dashboard />;
  if (fallback) return null;
  return <NoAccess />;
}

export function App() {
  return (
    <LocationProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Route path="/login" component={Login} />
              <Route path="/" component={protectedPage(Home)} />

              {/* Produk — rute statis sebelum :id agar /produk/create tidak tertangkap */}
              <Route path="/produk" component={protectedPage(ProdukList, { menu: 'produk' })} />
              <Route path="/produk/create" component={protectedPage(ProdukCreate, { menu: 'produk', action: 'create' })} />
              <Route path="/produk/:id/edit" component={protectedPage(ProdukEdit, { menu: 'produk', action: 'edit' })} />
              <Route path="/produk/:id/delete" component={protectedPage(ProdukDelete, { menu: 'produk', action: 'delete' })} />
              <Route path="/produk/:id" component={protectedPage(ProdukView, { menu: 'produk' })} />

              {/* Gudang — rute statis sebelum :id */}
              <Route path="/gudang" component={protectedPage(GudangList, { menu: 'gudang' })} />
              <Route path="/gudang/create" component={protectedPage(GudangCreate, { menu: 'gudang', action: 'create' })} />
              <Route path="/gudang/:id/edit" component={protectedPage(GudangEdit, { menu: 'gudang', action: 'edit' })} />
              <Route path="/gudang/:id/delete" component={protectedPage(GudangDelete, { menu: 'gudang', action: 'delete' })} />
              <Route path="/gudang/:id" component={protectedPage(GudangView, { menu: 'gudang' })} />

              {/* Stock In — rute statis sebelum :id */}
              <Route path="/stock-in" component={protectedPage(StockInList, { menu: 'stock-in' })} />
              <Route path="/stock-in/create" component={protectedPage(StockInCreate, { menu: 'stock-in', action: 'create' })} />
              <Route path="/stock-in/:id" component={protectedPage(StockInView, { menu: 'stock-in' })} />

              {/* Transaksi penjualan (kasir) — rute statis sebelum :id.
                  delete hanya untuk admin (kasir tak boleh hapus, lihat permissions). */}
              <Route path="/transaksi" component={protectedPage(TransactionList, { menu: 'cashier' })} />
              <Route path="/transaksi/create" component={protectedPage(TransactionCreate, { menu: 'cashier', action: 'create' })} />
              <Route path="/transaksi/:id/delete" component={protectedPage(TransactionDelete, { menu: 'cashier', action: 'delete' })} />
              <Route path="/transaksi/:id" component={protectedPage(TransactionView, { menu: 'cashier' })} />

              {/* Laporan kasir / closing — Owner (semua kasir) & kasir (sendiri) */}
              <Route path="/laporan" component={protectedPage(LaporanKasir, { menu: 'laporan' })} />

              {/* Pengguna — hanya Owner (lihat permissions) */}
              <Route path="/pengguna" component={protectedPage(PenggunaList, { menu: 'pengguna' })} />
              <Route path="/pengguna/create" component={protectedPage(PenggunaCreate, { menu: 'pengguna', action: 'create' })} />
              <Route path="/pengguna/:id" component={protectedPage(PenggunaView, { menu: 'pengguna' })} />

              <Route default component={NotFound} />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </LocationProvider>
  );
}
