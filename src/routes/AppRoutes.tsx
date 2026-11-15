import { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';

import CustomerLayout from '../layouts/CustomerLayout';
import ManagerLayout from '../layouts/ManagerLayout';
import AdminLayout from '../layouts/AdminLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import Home from '../pages/customer/Home';
import Books from '../pages/customer/Books';
import BookDetails from '../pages/customer/BookDetails';
import Authors from '../pages/customer/Authors';
import AuthorBooks from '../pages/customer/AuthorBooks';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import { PaymentCancel, PaymentSuccess } from '../pages/customer/PaymentResult';
import MyOrders from '../pages/customer/MyOrders';
import OrderDetails from '../pages/customer/OrderDetails';
import MyComplaints from '../pages/customer/MyComplaints';
import ComplaintDetails from '../pages/customer/ComplaintDetails';
import Profile from '../pages/customer/Profile';

import ManagerDashboard from '../pages/manager/ManagerDashboard';
import BooksManage from '../pages/manager/BooksManage';
import { AuthorsManage, CategoriesManage } from '../pages/manager/CatalogManage';
import Inventory from '../pages/manager/Inventory';
import Suppliers from '../pages/manager/Suppliers';
import SupplierOrders from '../pages/manager/SupplierOrders';
import OrdersManage from '../pages/manager/OrdersManage';
import Deliveries from '../pages/manager/Deliveries';
import ComplaintsManage from '../pages/manager/ComplaintsManage';
import ManagerReports from '../pages/manager/ManagerReports';

import AdminDashboard from '../pages/admin/AdminDashboard';
import Finance from '../pages/admin/Finance';
import Expenses from '../pages/admin/Expenses';
import Transactions from '../pages/admin/Transactions';
import AdminReports from '../pages/admin/AdminReports';
import Managers from '../pages/admin/Managers';
import Customers from '../pages/admin/Customers';

import NotFound from '../pages/NotFound';

const customerOnly = (element: ReactElement) => <ProtectedRoute roles={['CUSTOMER']}>{element}</ProtectedRoute>;

const AppRoutes = () => (
  <Routes>
    {/* Auth pages (no layout) */}
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
    <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    {/* Customer shopping site */}
    <Route element={<CustomerLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route path="/authors" element={<Authors />} />
      <Route path="/authors/:id" element={<AuthorBooks />} />
      <Route path="/cart" element={customerOnly(<Cart />)} />
      <Route path="/checkout" element={customerOnly(<Checkout />)} />
      <Route path="/payment/success" element={customerOnly(<PaymentSuccess />)} />
      <Route path="/payment/cancel" element={customerOnly(<PaymentCancel />)} />
      <Route path="/orders" element={customerOnly(<MyOrders />)} />
      <Route path="/orders/:id" element={customerOnly(<OrderDetails />)} />
      <Route path="/complaints" element={customerOnly(<MyComplaints />)} />
      <Route path="/complaints/:id" element={customerOnly(<ComplaintDetails />)} />
      <Route path="/profile" element={customerOnly(<Profile />)} />
      <Route path="*" element={<NotFound />} />
    </Route>

    {/* Manager dashboard */}
    <Route path="/manager" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><ManagerLayout /></ProtectedRoute>}>
      <Route index element={<ManagerDashboard />} />
      <Route path="books" element={<BooksManage />} />
      <Route path="authors" element={<AuthorsManage />} />
      <Route path="categories" element={<CategoriesManage />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="supplier-orders" element={<SupplierOrders />} />
      <Route path="orders" element={<OrdersManage />} />
      <Route path="deliveries" element={<Deliveries />} />
      <Route path="complaints" element={<ComplaintsManage />} />
      <Route path="reports" element={<ManagerReports />} />
    </Route>

    {/* Admin dashboard - finance pages exist ONLY here */}
    <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="finance" element={<Finance />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="managers" element={<Managers />} />
      <Route path="customers" element={<Customers />} />
      <Route path="books" element={<BooksManage />} />
      <Route path="authors" element={<AuthorsManage />} />
      <Route path="categories" element={<CategoriesManage />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="supplier-orders" element={<SupplierOrders />} />
      <Route path="orders" element={<OrdersManage />} />
      <Route path="deliveries" element={<Deliveries />} />
      <Route path="complaints" element={<ComplaintsManage />} />
    </Route>
  </Routes>
);

export default AppRoutes;