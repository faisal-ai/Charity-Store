#!/usr/bin/env python3
"""
Script to update navigation in remaining HTML pages
Updates:
1. Navigation structure with dropdowns
2. CSS version to v=16
3. Adds navigation.js script
4. Updates footer quick links
"""

import re

# List of files to update
files_to_update = [
    'donate-booking.html',
    'mentoring-booking.html',
    'story.html',
    'contact.html',
    'shop.html',
    'cart.html',
    'checkout.html',
    'product.html'
]

# New navigation HTML (to be inserted between <ul class="navbar-nav"> and </ul>)
new_nav = '''                        <li class="nav-item">
                            <a href="home.html" class="nav-link">Home</a>
                        </li>
                        <li class="nav-item">
                            <a href="donate-booking.html" class="nav-link">Donate Items</a>
                        </li>
                        <li class="nav-item">
                            <a href="mentoring-booking.html" class="nav-link">Book Mentoring</a>
                        </li>

                        <!-- Programmes & Resources with Dropdown -->
                        <li class="nav-item nav-dropdown">
                            <a href="programmes-resources.html" class="nav-link">
                                Programmes & Resources
                                <span class="dropdown-arrow">▼</span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="programmes-resources.html#mentoring-programs" class="dropdown-item">Mentoring Programs</a></li>
                                <li><a href="programmes-resources.html#resources" class="dropdown-item">Resources</a></li>
                            </ul>
                        </li>

                        <li class="nav-item">
                            <a href="story.html" class="nav-link">Our Story</a>
                        </li>

                        <!-- Impact & News with Dropdown -->
                        <li class="nav-item nav-dropdown">
                            <a href="impact-news.html" class="nav-link">
                                Impact & News
                                <span class="dropdown-arrow">▼</span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="impact-news.html#statistics" class="dropdown-item">Impact Statistics</a></li>
                                <li><a href="impact-news.html#success-stories" class="dropdown-item">Success Stories</a></li>
                                <li><a href="impact-news.html#events" class="dropdown-item">Events</a></li>
                                <li><a href="impact-news.html#news" class="dropdown-item">News & Updates</a></li>
            </ul>
                        </li>

                        <li class="nav-item">
                            <a href="contact.html" class="nav-link">Contact</a>
                        </li>'''

# New footer quick links
new_footer = '''                    <p><a href="donate-booking.html">Donate Items</a></p>
                    <p><a href="mentoring-booking.html">Book Mentoring</a></p>
                    <p><a href="programmes-resources.html">Programmes & Resources</a></p>
                    <p><a href="story.html">Our Story</a></p>
                    <p><a href="impact-news.html">Impact & News</a></p>'''

def update_file(filename):
    print(f"Updating {filename}...")

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Update CSS version
        content = re.sub(r'css/base\.css\?v=\d+', 'css/base.css?v=16', content)

        # 2. Replace navigation (between navbar-nav ul tags)
        nav_pattern = r'(<ul class="navbar-nav">)(.*?)(</ul>\s*</div>\s*</div>\s*</div>\s*</nav>)'
        content = re.sub(nav_pattern, r'\1\n' + new_nav + r'\n                    \3', content, flags=re.DOTALL)

        # 3. Add navigation.js script before </body> if not already present
        if 'navigation.js' not in content:
            content = content.replace('</body>', '    <script src="js/navigation.js?v=1"></script>\n</body>')

        # 4. Update footer quick links
        footer_pattern = r'(<h5>Quick Links</h5>\s*)(.*?)(\s*</div>)'
        footer_match = re.search(footer_pattern, content, re.DOTALL)
        if footer_match:
            # Find the old footer links and replace
            old_footer_links = footer_match.group(2)
            if 'impact.html' in old_footer_links or 'Impact</a>' in old_footer_links:
                content = re.sub(
                    r'(<h5>Quick Links</h5>\s*)<p>.*?</p>\s*<p>.*?</p>\s*(<p>.*?</p>\s*)?(<p>.*?</p>\s*)?(<p>.*?</p>\s*)?',
                    r'\1\n' + new_footer + r'\n                ',
                    content,
                    count=1,
                    flags=re.DOTALL
                )

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
    print("Starting bulk navigation update...\n")

    success_count = 0
    for filename in files_to_update:
        if update_file(filename):
            success_count += 1
        print()

    print(f"\n{'='*50}")
    print(f"Update complete: {success_count}/{len(files_to_update)} files updated successfully")
    print(f"{'='*50}")
