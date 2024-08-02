import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId, useCdn } from '../env';

let clientInstance: ReturnType<typeof createClient> | null = null;

export const getClient = () => {
  if (!clientInstance) {
    clientInstance = createClient({
      apiVersion,
      dataset,
      projectId,
      useCdn,
      // perspective: 'published',
    });
  }
  return clientInstance;
};