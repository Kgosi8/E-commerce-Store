import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/auth/login/login';
import { Register } from './components/pages/auth/register/register';
import { AddToCart } from './components/partials/add-to-cart/add-to-cart';

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
    }
];
