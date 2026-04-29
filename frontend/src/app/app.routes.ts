import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/auth/login/login';
import { Register } from './components/pages/auth/register/register';
import { AddToCart } from './components/pages/add-to-cart/add-to-cart';
import { Cart } from './components/pages/cart/cart';
import { adminGuard } from './guards/admin-guard';
import { create } from 'domain';
import { CreateProduct } from './components/pages/create-product/create-product';
import { ProductList } from './components/pages/product-list/product-list';


export const routes: Routes = [
    {
        path:'',
        component: Home,
    },
    {
        path: 'login',
        component: Login,
    },{
        path: 'register',
        component: Register
    },{
        path:'add-to-cart/:id',
        component:AddToCart
    },
    {
        path:'cart',
        component:Cart
    },
    {
        path:'admin-dashboard',
        loadComponent() {
            return import('./components/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard);
        },
        // canActivate: [adminGuard],
        // children: [
        //     {path:'create', component:CreateProduct},
        //     {path:'products', component:ProductList},
        // ]
    }
];
