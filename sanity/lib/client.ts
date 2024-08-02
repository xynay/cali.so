import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId, useCdn } from '../env';

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
  // perspective: 'published',
});

export { client };