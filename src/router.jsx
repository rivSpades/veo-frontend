import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, OnboardingRoute, AuthRequiredRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyMagicLink from './pages/VerifyMagicLink';
import VerifyPhone from './pages/VerifyPhone';
import ChangePhone from './pages/ChangePhone';
import Onboarding from './pages/Onboarding';
import Preview from './pages/Preview';
import Dashboard from './pages/Dashboard';
import Menus from './pages/Menus';
import MenuCreate from './pages/MenuCreate';
import MenuEdit from './pages/MenuEdit';
import MenuPreview from './pages/MenuPreview';
import QRCodes from './pages/QRCodes';
import Settings from './pages/Settings';
import Help from './pages/Help';

/**
 * Router Configuration
 * Defines all routes with their loaders and actions
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    loader: Landing.loader,
  },
  {
    path: '/auth/login',
    element: <PublicRoute><Login /></PublicRoute>,
    loader: Login.loader,
  },
  {
    path: '/auth/register',
    element: <Register />,
    loader: Register.loader,
  },
  {
    path: '/auth/verify',
    element: <VerifyMagicLink />,
    loader: VerifyMagicLink.loader,
  },
  {
    path: '/auth/verify-phone',
    element: <AuthRequiredRoute><VerifyPhone /></AuthRequiredRoute>,
    loader: VerifyPhone.loader,
  },
  {
    path: '/auth/change-phone',
    element: <AuthRequiredRoute><ChangePhone /></AuthRequiredRoute>,
    loader: ChangePhone.loader,
  },
  {
    path: '/onboarding',
    element: <OnboardingRoute><Onboarding /></OnboardingRoute>,
    loader: Onboarding.loader,
  },
  {
    path: '/preview',
    element: <Preview />,
    loader: Preview.loader,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    loader: Dashboard.loader,
  },
  {
    path: '/dashboard/menus',
    element: <ProtectedRoute><Menus /></ProtectedRoute>,
    loader: Menus.loader,
  },
  {
    path: '/dashboard/menus/create',
    element: <ProtectedRoute><MenuCreate /></ProtectedRoute>,
    loader: MenuCreate.loader,
  },
  {
    path: '/dashboard/menus/:id/edit',
    element: <ProtectedRoute><MenuEdit /></ProtectedRoute>,
    loader: MenuEdit.loader,
  },
  {
    path: '/preview/:id',
    element: <MenuPreview />,
    loader: MenuPreview.loader,
  },
  {
    path: '/dashboard/qr-codes',
    element: <ProtectedRoute><QRCodes /></ProtectedRoute>,
    loader: QRCodes.loader,
  },
  {
    path: '/dashboard/settings',
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: '/dashboard/help',
    element: <ProtectedRoute><Help /></ProtectedRoute>,
  },
]);

export default router;
