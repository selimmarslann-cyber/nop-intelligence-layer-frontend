// utils/sanity.js
import { fetchGROQ } from '../lib/sanity';

/**
 * Search posts using GROQ query
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query text
 * @param {string} params.tag - Tag filter
 * @returns {Promise<Array>} Array of posts
 */
export async function searchPostsGROQ({ q = '', tag = '' }) {
  try {
    let query = '*[_type == "post"';
    
    const conditions = [];
    if (q) {
      conditions.push(`(title match "*${q}*" || body match "*${q}*")`);
    }
    if (tag) {
      conditions.push(`"${tag}" in tags`);
    }
    
    if (conditions.length > 0) {
      query += ` && (${conditions.join(' && ')})`;
    }
    
    query += '] | order(_createdAt desc) [0...20]';
    
    const posts = await fetchGROQ(query);
    return posts || [];
  } catch (err) {
    console.error('Search posts error:', err);
    return [];
  }
}

