<template>
    <div class="users-page">
      <EntityTable
        v-bind="tableConfig"
        :rows="users"
        @delete="deleteUser"
        @view="viewUser"
      />
    </div>
</template>

<script>

import EntityTable from '@/layout/EntityTable.vue'
import usersService from '@/services/users.service'
import '@/assets/style_modal.css'
export default {

  name: 'Users',
  components: {
    EntityTable
  },
  data() {
    return {
      users: [],
      tableConfig: {

        entityName: 'users',
        searchPlaceholder: 'Search users by username, email...',

        emptyMessage: 'No users found.',
        showPlayButton: false,
        itemsPerPage: 15,
        searchableColumns: ['username', 'email', 'role'],
        columns: [
          {
            key: 'avatar_url',
            label: 'Avatar',
            type: 'avatar',
            sortable: false
          },
          {
            key: 'user_id',
            label: 'ID',
            type: 'text',
            sortable: true,
            maxLength: 10
          },
          {
            key: 'username',
            label: 'Username',
            type: 'text',
            sortable: true,
            maxLength: 20
          },
          {
            key: 'email',
            label: 'Email',
            type: 'text',
            sortable: true,
            maxLength: 35
          },
          {
            key: 'role',
            label: 'Role',
            type: 'badge',
            sortable: true
          },
          {
            key: 'created_at',
            label: 'Joined',
            type: 'date',
            sortable: true
          },
          {
            key: 'actions',
            label: 'Actions',
            type: 'actions',
            sortable: false,
            maxLength: 0
          }
        ]
      }
    }
  },
  methods: {
    async fetchUsers() {
      try {
        console.log('Fetching users from API...')

        const response = await usersService.getAll()
        console.log('Raw API Response:', response)

        let usersData = []

        if (response && response.status === 'success' && response.data) {
          if (Array.isArray(response.data)) {
            usersData = response.data
          } else if (response.data.users && Array.isArray(response.data.users)) {
            usersData = response.data.users
          } else if (response.data.data && Array.isArray(response.data.data)) {
            usersData = response.data.data
          }
        } else if (Array.isArray(response)) {
          usersData = response
        }

        this.users = usersData.map(user => ({
          user_id: user.user_id || user.id,
          username: user.username || user.name || 'Unknown',
          email: user.email || 'No email',
          avatar_url: user.avatar_url ? `/public/uploads/images${user.avatar_url}` : null,
          role: user.role || 'user',
          created_at: user.created_at,
          password_hash: undefined
        }))

        console.log('Users loaded successfully:', this.users.length)
        if (this.users.length > 0) {
          console.log('First user example:', this.users[0])
        }

      } catch (error) {
        console.error('Error fetching users:', error)
        this.users = []

        const errorMessage = error.response?.data?.message ||
                            error.response?.data?.error ||
                            error.message ||
                            'Failed to connect to server'

        console.warn(`Failed to load users: ${errorMessage}`)
      }
    },

    viewUser(user) {
      console.log('Viewing user details:', user.username)

      const joinDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : 'Unknown'

      const details = `User Details:

ID: ${user.user_id}
Username: ${user.username}
Email: ${user.email}
Role: ${user.role}
Avatar: ${user.avatar_url ? 'Yes' : 'No'}
Joined: ${joinDate}`

      alert(details)
    },

    async deleteUser(user) {
      const confirmMessage = `Are you sure you want to delete user "${user.username}"?\n\nThis action cannot be undone.`
      if (!confirm(confirmMessage)) {
        return
      }

      try {
        console.log('Deleting user:', user.username)

        await usersService.delete(user.user_id)

        this.users = this.users.filter(u => u.user_id !== user.user_id)

        console.log('User deleted successfully')
        alert(`User "${user.username}" has been deleted successfully.`)

        await this.fetchUsers()

      } catch (error) {
        console.error('Error deleting user:', error)
        const errorMessage = error.response?.data?.message || error.message
        alert(`Failed to delete user: ${errorMessage}`)

        await this.fetchUsers()
      }
    }
  },

  mounted() {
    console.log('Users component mounted')
    console.log('Available APIs:', { usersService })
    this.fetchUsers()
  }
}
</script>

