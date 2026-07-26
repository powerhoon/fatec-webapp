/**
 * Fatec System — Build Script
 * Generates posts/index.json from markdown files for blog loading
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');
const OUTPUT_FILE = path.join(POSTS_DIR, 'index.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const frontmatter = match[1];
  const body = match[2];
  const data = {};

  frontmatter.split('\n').forEach(function(line) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.substring(0, colonIdx).trim();
    var value = line.substring(colonIdx + 1).trim();
    // Remove surrounding quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    data[key] = value;
  });

  return { data: data, body: body };
}

function buildPostsIndex() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  var files = [];
  try {
    files = fs.readdirSync(POSTS_DIR).filter(function(f) { return f.endsWith('.md'); });
  } catch (e) {
    console.log('No posts directory or files found');
  }

  var posts = files.map(function(filename) {
    var filePath = path.join(POSTS_DIR, filename);
    var content = fs.readFileSync(filePath, 'utf-8');
    var parsed = parseFrontmatter(content);
    var slug = parsed.data.slug || filename.replace('.md', '');

    return {
      title: parsed.data.title || slug,
      date: parsed.data.date || '',
      slug: slug,
      author: parsed.data.author || 'Fatec System',
      category: parsed.data.category || 'Uncategorized',
      excerpt: parsed.data.excerpt || '',
      body: parsed.body.trim()
    };
  });

  // Sort by date descending
  posts.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
  console.log('Built posts/index.json with ' + posts.length + ' posts');
}

buildPostsIndex();
