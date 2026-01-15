#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');

const errors = [];

const loadJson = (relativePath) => {
  const target = path.join(projectRoot, relativePath);
  try {
    const raw = readFileSync(target, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`Unable to read ${relativePath}: ${error.message}`);
    return null;
  }
};

const getValue = (obj, keys) => {
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

const profileData = loadJson('src/profile.json');
if (profileData) {
  const profileExpectations = [
    {
      path: ['personal', 'name', 'first'],
      expected: 'Jane',
      description: 'profile.personal.name.first must stay as "Jane" for the demo profile'
    },
    {
      path: ['personal', 'name', 'last'],
      expected: 'Doe',
      description: 'profile.personal.name.last must stay as "Doe" for the demo profile'
    },
    {
      path: ['personal', 'email'],
      expected: 'jane.demo@example.com',
      description: 'profile.personal.email must stay as the placeholder email'
    },
    {
      path: ['personal', 'phone', 'mobile'],
      expected: '+44 7700 900123',
      description: 'profile.personal.phone.mobile must stay as the placeholder phone number'
    },
    {
      path: ['personal', 'vague_address', 'text'],
      expected: 'Demoshire, United Kingdom',
      description: 'profile.personal.vague_address.text must stay as the placeholder location'
    }
  ];

  profileExpectations.forEach(({ path: keys, expected, description }) => {
    const actual = getValue(profileData, keys);
    if (actual !== expected) {
      errors.push(`[profile.json] ${description} (expected "${expected}", found "${actual ?? 'undefined'}")`);
    }
  });
}

const blogData = loadJson('src/blog.json');
if (blogData) {
  if (!Array.isArray(blogData.posts) || blogData.posts.length !== 1) {
    errors.push('[blog.json] Demo data must contain exactly one placeholder post.');
  } else {
    const [firstPost] = blogData.posts;
    const blogExpectations = [
      {
        key: 'slug',
        expected: 'example-blog-post',
        description: 'demo blog post slug should remain "example-blog-post"'
      },
      {
        key: 'title',
        expected: 'Example Blog Post',
        description: 'demo blog post title should remain "Example Blog Post"'
      },
      {
        key: 'author',
        expected: 'Jane Doe',
        description: 'demo blog post author should remain "Jane Doe"'
      }
    ];

    blogExpectations.forEach(({ key, expected, description }) => {
      if (firstPost[key] !== expected) {
        errors.push(`[blog.json] ${description} (expected "${expected}", found "${firstPost[key] ?? 'undefined'}")`);
      }
    });
  }

  if (!blogData.metadata || blogData.metadata.total_posts !== 1) {
    errors.push('[blog.json] metadata.total_posts must be 1 for the placeholder data.');
  } else if (blogData.metadata.version !== '1.0.0') {
    errors.push('[blog.json] metadata.version should remain "1.0.0" for the placeholder data.');
  }
}

if (errors.length > 0) {
  console.error('Demo data validation failed:');
  errors.forEach((message) => console.error(`  • ${message}`));
  console.error('\nPlease revert the sensitive changes or regenerate the demo data before committing.');
  process.exit(1);
}

console.log('Demo data check passed: placeholder profile and blog data detected.');
