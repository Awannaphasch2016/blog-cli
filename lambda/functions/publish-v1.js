/**
 * Lambda function for blog publishing (v1)
 * Handles Dev.to publishing and Supabase snapshots
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

/**
 * Get credentials from environment variables
 */
function getCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const devtoKey = process.env.DEVTO_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  if (!devtoKey) {
    throw new Error('Dev.to API key not configured');
  }

  return { supabaseUrl, supabaseKey, devtoKey };
}

/**
 * Publish article to Dev.to
 */
async function publishToDevto(article, apiKey) {
  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      article: {
        title: article.title,
        published: article.published || false,
        body_markdown: article.content,
        tags: article.tags || [],
        canonical_url: article.canonical_url
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dev.to API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Save snapshot to Supabase
 */
async function saveSnapshot(article, publishResult, credentials) {
  const supabase = createClient(credentials.supabaseUrl, credentials.supabaseKey);

  const { data, error } = await supabase
    .from('blog_snapshots')
    .insert({
      title: article.title,
      content: article.content,
      devto_id: publishResult.id,
      devto_url: publishResult.url,
      published_at: new Date().toISOString(),
      metadata: {
        tags: article.tags,
        canonical_url: article.canonical_url,
        function_version: 'v1'
      }
    });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}

/**
 * Lambda handler
 */
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { article, options = {} } = body;

    if (!article || !article.title || !article.content) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'error',
          error: 'Article with title and content is required'
        })
      };
    }

    const creds = getCredentials();

    // Publish to Dev.to
    const publishResult = await publishToDevto(article, creds.devtoKey);

    // Save snapshot to Supabase
    const snapshot = await saveSnapshot(article, publishResult, creds);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        article: publishResult,
        snapshot: snapshot,
        metadata: {
          version: 'v1',
          timestamp: new Date().toISOString(),
          functionVersion: process.env.FUNCTION_VERSION || 'v1'
        }
      })
    };

  } catch (error) {
    console.error('Blog publish function error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'error',
        error: error.message,
        metadata: {
          version: 'v1',
          timestamp: new Date().toISOString()
        }
      })
    };
  }
};