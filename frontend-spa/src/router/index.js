
import { createRouter, createWebHistory } from 'vue-router';
import authService from '@/services/auth.service';
import UserLayout from '@/layout/SideBar.vue';
import AdminLayout from '@/layout/AdminLayout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      requiresAuth: false,
      hideLayout: true,
      title: 'Login',
    },
  },
  {
    path: '/',
    component: UserLayout,
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('@/views/Home.vue'),
        meta: { title: 'Trang chủ', icon: 'fas fa-home' },
      },
      {
        path: 'albums',
        name: 'Albums',
        component: () => import('@/views/Library/AlbumLibrary.vue'),
        meta: { title: 'Albums', icon: 'fas fa-music' },
      },
      {
        path: '/albums/:id',
        name: 'album-detail',
        component: () => import('@/views/Detail/AlbumDetail.vue'),
        props: true,
        meta: {
          title: 'Album Detail',
          hideInSidebar: true,
        },
      },
      {
        path: 'artists',
        name: 'Artists',
        component: () => import('@/views/Library/ArtistLibrary.vue'),
        meta: { title: 'Artists' },
      },
      {
        path: '/artists/:id',
        name: 'artist-detail',
        component: () => import('@/views/Detail/ArtistDetail.vue'),
        props: true,
        meta: {
          title: 'Artist',
        },
      },
      {
        path: 'playlists',
        name: 'Playlists',
        component: () => import('@/views/Library/PlaylistLibrary.vue'),
        meta: { title: 'Playlists', icon: 'fas fa-music' },
      },
      {
        path: '/playlists/:id',
        name: 'playlist-detail',
        component: () => import('@/views/Detail/PlaylistDetail.vue'),
        props: true,
        meta: {
          title: 'Playlist Detail',
          hideInSidebar: true,
        },
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/Favorites.vue'),
        meta: { title: 'Favorites', icon: 'fas fa-heart' },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/Search.vue'),
        meta: { title: 'Search' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Setting.vue'),
        meta: { title: 'Settings' },
      },
      {
        path: '/queue',
        name: 'queue',
        component: () => import('@/views/Queue.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: () => import('@/views/ad.Home.vue'),
        meta: { title: 'Admin Dashboard' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/ad.Users.vue'),
        meta: { title: 'User Management' },
      },
      {
        path: 'albums',
        name: 'AdminAlbums',
        component: () => import('@/views/ad.Album.vue'),
        meta: { title: 'Albums' },
      },
      {
        path: 'artists',
        name: 'AdminArtists',
        component: () => import('@/views/ad.Artists.vue'),
        meta: { title: 'Artists' },
      },
      {
        path: 'songs',
        name: 'AdminSongs',
        component: () => import('@/views/ad.Songs.vue'),
        meta: { title: 'Songs' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: async () => {
      const isAdmin = await authService.checkAuth();
      return isAdmin ? '/admin' : '/';
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.role;

  console.log(`Navigating to: ${to.path}, Requires auth: ${requiresAuth}, Required role: ${requiredRole}`);

  if (!requiresAuth) {
    console.log('No auth required, proceeding');
    return next();
  }

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  console.log(`Token: ${token ? 'present' : 'missing'}, UserId: ${userId ? 'present' : 'missing'}`);

  if (!token || !userId) {
    console.warn('No token or userId, redirecting to /login');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    return next('/login');
  }

  let user;
  try {
    user = await authService.getUser(userId, token);
    console.log('Fetched user:', user);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.warn('Error fetching user:', err.message);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    return next('/login');
  }

  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Role mismatch: user.role=${user.role}, required=${requiredRole}`);
    if (user.role === 'admin') {
      console.log('Admin user, redirecting to /admin');
      return next('/admin');
    }
    if (user.role === 'user') {
      console.log('User role, redirecting to /');
      return next('/');
    }
    console.warn('Unknown role, redirecting to /login');
    return next('/login');
  }

  console.log('Access granted, proceeding to:', to.path);
  return next();
});

export default router;
