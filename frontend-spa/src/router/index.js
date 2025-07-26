import { createRouter, createWebHistory } from 'vue-router'

import SidebarLayout from '@/layout/SideBar.vue'
import AlbumsLibrary from '@/views/Library/AlbumLibrary.vue'

const routes = [
  {
    path: '/',
    component: SidebarLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: 'Trang chủ',
          icon: 'fas fa-home'
        }
      },
      {
        path: '/playlists',
        name: 'playlists',
        component: () => import('@/views/Library/PlaylistLibrary.vue'),
        meta: {
          title: 'Playlists',
          icon: 'fas fa-music'
        }
      },
      {
        path: '/playlists/:id',
        name: 'playlist-detail',
        component: () => import('@/views/Detail/PlaylistDetail.vue'),
        props: true,
        meta: {
          title: 'Playlist Detail',
          hideInSidebar: true
        }
      },
      {
        path: '/artists',
        name: 'artists',
        component: () => import('@/views/Library/ArtistLibrary.vue'),
        meta: {
          title: 'Artists'
        }
      },
      {
        path: '/artists/:id',
        name: 'artist-detail',
        component: () => import('@/views/Detail/ArtistDetail.vue'),
        props: true,
        meta: {
          title: 'Artist'
        }
      },
      {
        path: '/albums/:id',
        name: 'album-detail',
        component: () => import('@/views/Detail/AlbumDetail.vue'),
        props: true,
        meta: {
          title: 'Album Detail',
          hideInSidebar: true
        }
      },
      {
        path: '/search',
        name: 'search',
        component: () => import('@/views/Search.vue'),
        meta: {
          title: 'Search',
          icon: 'fas fa-search',
          hideInSidebar: true
        }
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/Setting.vue'),
        meta: {
          title: 'Search',
          icon: 'fas fa-search',
          hideInSidebar: true
        }
      },
      {
        path: '/favorites',
        name: 'favorites',
        component: () => import('@/views/Favorites.vue'),
        meta: {
          title: 'Favorites',
          icon: 'fas fa-heart'
        }
      },
      {
        path: '/albums',
        name: 'albums-library',
        component: AlbumsLibrary,
        meta: {
          title: 'Albums',
          icon: 'fas fa-music',
          requiresAuth: true
        }
      },

      {
        path: '/player',
        name: 'player',
        component: () => import('@/components/Player.vue'),
        meta: {
          title: 'Now Playing',
          icon: 'fas fa-play-circle',
          hideInSidebar: true
        }
      },
      {
        path: '/queue',
        name: 'queue',
        component: () => import('@/views/Queue.vue'),

      },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: 'Login',
      hideInSidebar: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | MyMusic`
    : 'MyMusic'
})

export default router
