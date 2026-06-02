import { Route, Routes, Navigate } from 'react-router'
import Login from './pages/Login'
import QuoteById from './pages/QouteById'
import PrivateRoute from './pages/PrivateRoute';
import Quotes from './pages/Quotes';
import Products from './pages/Products';
import Features from './pages/Features';

const publicRoutes = [
  {
    key: 'login',
    path: 'login',
    component: Login,
    title: 'Login',
  },
  {
    key: 'quote-by-id',
    path: 'quote/:id',
    component: QuoteById,
    title: 'Quote By Id',
  }
];

const privateRoutes = [
  {
    key: 'quotes',
    path: 'quotes',
    component: Quotes,
    title: 'Quotes',
  },
  {
    key: 'products',
    path: 'products',
    component: Products,
    title: 'Products',
  },
  {
    key: 'features',
    path: 'features',
    component: Features,
    title: 'Features',
  },
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {publicRoutes.map((route) => (
        <Route
          key={route.key}
          path={route.path}
          element={<route.component />}
        />
      ))}

      {privateRoutes.map((route) => (
        <Route
          key={route.key}
          path={route.path}
          element={
            <PrivateRoute>
              <route.component />
            </PrivateRoute>
          }
        />
      ))}
    </Routes>
  )
}

export default App
