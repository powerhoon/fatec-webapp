#!/usr/bin/env python3
"""WITTENSTEIN media crawler - extract images from key pages"""
import re, sys, json
import subprocess

SUPABASE_URL = "https://oatxlqxbsnfvoyopidla.supabase.co"

def get_admin_key():
    import subprocess
    result = subprocess.run(
        """bw list items --search supabase-fatec 2>&1 | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['notes'])" """,
        shell=True, capture_output=True, text=True,
        env={**__import__('os').environ, 'BW_SESSION':'Xq/CtmzhYq9CxSCkUEQ0PO59b1litBStVCVVsN/A0L61/bd8jbjBYgq+3LU80GSiaoA5Ix7aCuBwYKiuQgRw1g=='}
    )
    return result.stdout.strip()

# Pages to crawl
PAGES = {
    "home": "https://www.wittenstein-group.com/en-us",
    "products": "https://www.wittenstein-group.com/en-us/products/",
    "gearboxes": "https://www.wittenstein-group.com/en-us/products/servo-gearboxes/",
    "motors": "https://www.wittenstein-group.com/en-us/products/servo-motors/",
    "actuators": "https://www.wittenstein-group.com/en-us/products/servo-actuators/",
    "drives": "https://www.wittenstein-group.com/en-us/products/servo-drive-systems/",
}

def crawl_page(name, url):
    """Extract image URLs from page HTML"""
    html = subprocess.run(['curl', '-s', '-L', '--max-time', '30', url],
                         capture_output=True, text=True).stdout
    
    # Find all image URLs in HTML source
    img_urls = set()
    # Match src and srcset attributes
    for m in re.finditer(r'(?:src|srcset)=["\']([^"\']+\.(?:webp|jpg|jpeg|png|svg))["\']', html, re.I):
        src = m.group(1)
        if src.startswith('/'):
            src = 'https://www.wittenstein-group.com' + src
        if 'wittenstein-group.com' in src or 'wittenstein' in src.lower():
            img_urls.add(src)
    
    # Also find in background-image CSS
    for m in re.finditer(r'url\(["\']?([^"\')\s]+\.(?:webp|jpg|jpeg|png|svg))["\']?\)', html, re.I):
        src = m.group(1)
        if src.startswith('/'):
            src = 'https://www.wittenstein-group.com' + src
        img_urls.add(src)
    
    return sorted(img_urls)

def download_upload(url, bucket, filename, admin_key):
    """Download image and upload to Supabase"""
    import tempfile, os
    tmp = f'/tmp/{filename}'
    
    # Download
    r = subprocess.run(['curl', '-s', '-L', '-o', tmp, '--max-time', '30', url])
    if r.returncode != 0: return None
    
    size = os.path.getsize(tmp)
    if size < 1000:  # Too small
        os.remove(tmp)
        return None
    
    content_type = 'image/webp' if filename.endswith('.webp') else \
                   'image/jpeg' if filename.endswith(('.jpg','.jpeg')) else \
                   'image/png' if filename.endswith('.png') else \
                   'image/svg+xml' if filename.endswith('.svg') else 'application/octet-stream'
    
    # Upload
    upload_url = f'{SUPABASE_URL}/storage/v1/object/{bucket}/{filename}'
    r = subprocess.run([
        'curl', '-s', '-X', 'POST', upload_url,
        '-H', f'apikey: {admin_key}',
        '-H', f'Authorization: Bearer {admin_key}',
        '-H', f'Content-Type: {content_type}',
        '--data-binary', f'@{tmp}'
    ], capture_output=True, text=True)
    
    os.remove(tmp)
    
    if 'Key' in r.stdout:
        pub_url = f'{SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}'
        return {'url': pub_url, 'size': size}
    return None

if __name__ == '__main__':
    admin_key = get_admin_key()
    if not admin_key:
        print("ERROR: Cannot get admin key")
        sys.exit(1)
    
    print(f"Admin key loaded: {admin_key[:10]}...")
    print()
    
    all_images = {}
    for name, url in PAGES.items():
        print(f"Crawling: {name} -> {url}")
        try:
            imgs = crawl_page(name, url)
            all_images[name] = imgs
            print(f"  Found {len(imgs)} images")
        except Exception as e:
            print(f"  Error: {e}")
    
    # Summary
    total = sum(len(v) for v in all_images.values())
    print(f"\n=== Total: {total} images across {len(PAGES)} pages ===")
    
    for name, imgs in all_images.items():
        print(f"\n--- {name} ({len(imgs)}) ---")
        for img in imgs[:5]:
            fn = img.split('/')[-1][:60]
            print(f"  {fn}")
        if len(imgs) > 5:
            print(f"  ... and {len(imgs)-5} more")
    
    print("\n=== Download & Upload ===")
    uploaded = 0
    for name, imgs in all_images.items():
        for img in imgs:
            fn = img.split('/')[-1].split('?')[0]
            if len(fn) > 80:
                fn = fn[:80]
            # Prefix with page name
            fn = f"{name}_{fn}"
            result = download_upload(img, 'images', fn, admin_key)
            if result:
                uploaded += 1
                print(f"  ✅ {fn} ({result['size']//1024}KB)")
            else:
                print(f"  ⏭️  skip: {fn} (too small)")
    
    print(f"\n=== Done! Uploaded {uploaded} images ===")