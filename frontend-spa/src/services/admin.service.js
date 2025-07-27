import { efetch } from '@/services/efetch';
export default {
  async getStats() {
    return await efetch('/api/v1/admin/total')
  }
}
