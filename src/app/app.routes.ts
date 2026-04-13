import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { TournamentPage } from './pages/tournament-page/tournament-page';

export const routes: Routes = [
    {path: 'Home', component: LandingPage},
    {path: 'Tournament', component: TournamentPage},
    
    { path: '', redirectTo: '/Home', pathMatch: 'full' },
    { path: '**', redirectTo: '/Home' }
];
