import { efetch } from '@/services/efetch';
export default {
async search(query) {
    if (!query) return { status: 'error', data: {} };
  return  await efetch(`/api/search?q=${(query)}`);
  }
}
