import { LocationProvider, Router, Route } from 'preact-iso';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <LocationProvider>
      <Layout>
        <Router>
          <Route path="/" component={Home} />
          <Route default component={NotFound} />
        </Router>
      </Layout>
    </LocationProvider>
  );
}
