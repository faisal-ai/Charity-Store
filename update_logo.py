#!/usr/bin/env python3
"""
Script to replace "BU Mentoring" text with logo image in navbar
"""

import re

# List of all HTML files to update
files_to_update = [
    'index.html',
    'home.html',
    'donate-booking.html',
    'mentoring-booking.html',
    'story.html',
    'contact.html',
    'shop.html',
    'cart.html',
    'checkout.html',
    'product.html',
    'programmes-resources.html',
    'impact-news.html'
]

def update_file(filename):
    print(f"Updating {filename}...")

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace navbar-brand text with logo image
        # Pattern: <a href="home.html" class="navbar-brand">BU Mentoring</a>
        old_pattern = r'<a href="home\.html" class="navbar-brand">BU Mentoring</a>'
        new_markup = '<a href="home.html" class="navbar-brand">\n                        <img src="images/logo.png" alt="BU Mentoring" class="navbar-logo">\n                    </a>'

        content = re.sub(old_pattern, new_markup, content)

        # Write back
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Successfully updated {filename}")
        return True

    except Exception as e:
        print(f"❌ Error updating {filename}: {e}")
        return False

# Main execution
if __name__ == '__main__':
    print("Replacing BU Mentoring text with logo image...\n")

    success_count = 0
    for filename in files_to_update:
        if update_file(filename):
            success_count += 1
        print()

    print(f"\n{'='*60}")
    print(f"Update complete: {success_count}/{len(files_to_update)} files updated")
    print(f"{'='*60}")
    print("\nIMPORTANT: Please save your logo as 'images/logo.png'")
