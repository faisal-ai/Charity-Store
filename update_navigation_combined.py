#!/usr/bin/env python3
"""
Script to update navigation - combine Our Story & Contact into dropdown
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

# New navigation structure with Our Story & Contact combined
def get_nav_for_page(filename):
    """Generate navigation HTML with correct active state for each page"""

    # Determine which link should be active
    is_home = filename in ['index.html', 'home.html']
    is_donate = 'donate-booking' in filename
    is_mentoring = 'mentoring-booking' in filename
    is_programmes = 'programmes-resources' in filename
    is_story_or_contact = filename in ['story.html', 'contact.html']
    is_impact = 'impact-news' in filename

    nav = f'''                        <li class="nav-item">
                            <a href="home.html" class="nav-link{'active' if is_home else ''}">Home</a>
                        </li>
                        <li class="nav-item">
                            <a href="donate-booking.html" class="nav-link{' active' if is_donate else ''}">Donate Items</a>
                        </li>
                        <li class="nav-item">
                            <a href="mentoring-booking.html" class="nav-link{' active' if is_mentoring else ''}">Book Mentoring</a>
                        </li>

                        <!-- Programmes & Resources with Dropdown -->
                        <li class="nav-item nav-dropdown">
                            <a href="programmes-resources.html" class="nav-link{' active' if is_programmes else ''}">
                                Programmes & Resources
                                <span class="dropdown-arrow">▼</span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="programmes-resources.html#mentoring-programs" class="dropdown-item">Mentoring Programs</a></li>
                                <li><a href="programmes-resources.html#resources" class="dropdown-item">Resources</a></li>
                            </ul>
                        </li>

                        <!-- Impact & News with Dropdown -->
                        <li class="nav-item nav-dropdown">
                            <a href="impact-news.html" class="nav-link{' active' if is_impact else ''}">
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

                        <!-- Our Story & Contact with Dropdown -->
                        <li class="nav-item nav-dropdown">
                            <a href="contact.html" class="nav-link{' active' if is_story_or_contact else ''}">
                                About & Contact
                                <span class="dropdown-arrow">▼</span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="story.html" class="dropdown-item">Our Story</a></li>
                                <li><a href="contact.html" class="dropdown-item">Contact Us</a></li>
                            </ul>
                        </li>'''

    return nav

def update_file(filename):
    print(f"Updating {filename}...")

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Get the new navigation for this specific page
        new_nav = get_nav_for_page(filename)

        # Replace navigation (between navbar-nav ul tags)
        nav_pattern = r'(<ul class="navbar-nav">)(.*?)(</ul>\s*</div>\s*</div>\s*</div>\s*</nav>)'
        content = re.sub(nav_pattern, r'\1\n' + new_nav + r'\n                    \3', content, flags=re.DOTALL)

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
    print("Starting navigation update - combining Our Story & Contact...\n")

    success_count = 0
    for filename in files_to_update:
        if update_file(filename):
            success_count += 1
        print()

    print(f"\n{'='*60}")
    print(f"Update complete: {success_count}/{len(files_to_update)} files updated")
    print(f"{'='*60}")
