/**
 * ============================================
 * FOOTER CONFIGURATION
 * Centralized footer structure for entire site
 * ============================================
 */

const FOOTER_CONFIG = {
    containerId: 'global-footer',
    brandName: 'MHMV 2026',
    brandLogo: null, // Optional: '/assets/images/logo.png'
    description: 'Excellence in Education. Empowering students with quality learning and comprehensive exam preparation.',

    // Social Media Links
    socialLinks: [
        {
            name: 'Facebook',
            url: 'https://facebook.com/yourpage',
            icon: 'ph-fill ph-facebook-logo'
        },
        {
            name: 'Instagram',
            url: 'https://instagram.com/yourpage',
            icon: 'ph-fill ph-instagram-logo'
        },
        {
            name: 'YouTube',
            url: 'https://youtube.com/yourchannel',
            icon: 'ph-fill ph-youtube-logo'
        },
        {
            name: 'Twitter',
            url: 'https://twitter.com/yourpage',
            icon: 'ph-fill ph-twitter-logo'
        }
    ],

    // Footer Columns
    columns: [
        // Quick Links
        {
            title: 'Quick Links',
            type: 'menu',
            items: [
                {
                    label: 'Home',
                    href: '/index.html',
                    icon: 'ph ph-house'
                },
                {
                    label: 'About Us',
                    href: '/pages/about/index.html',
                    icon: 'ph ph-info'
                },
                {
                    label: 'Services',
                    href: '/pages/services/index.html',
                    icon: 'ph ph-briefcase'
                },
                {
                    label: 'News & Updates',
                    href: '/pages/news/index.html',
                    icon: 'ph ph-newspaper'
                }
            ]
        },

        // Student Resources
        {
            title: 'For Students',
            type: 'menu',
            items: [
                {
                    label: 'Check Results',
                    href: '/pages/results/index.html',
                    icon: 'ph ph-trophy'
                },
                {
                    label: 'Creative Corner',
                    href: '/pages/students/creative.html',
                    icon: 'ph ph-paint-brush'
                },
                {
                    label: 'Tuition Booking',
                    href: '/pages/students/booking.html',
                    icon: 'ph ph-calendar-check'
                },
                {
                    label: 'Poster Builder',
                    href: '/pages/poster-builder/index.html',
                    icon: 'ph ph-palette',
                    badge: 'New'
                }
            ]
        },

        // Contact Information
        {
            title: 'Contact Us',
            type: 'contact',
            items: [
                {
                    icon: 'ph ph-map-pin',
                    text: 'Your Address Here, City, State - 123456'
                },
                {
                    icon: 'ph ph-phone',
                    text: '+91 1234567890',
                    link: 'tel:+911234567890'
                },
                {
                    icon: 'ph ph-envelope',
                    text: 'info@yourdomain.com',
                    link: 'mailto:info@yourdomain.com'
                },
                {
                    icon: 'ph ph-clock',
                    text: 'Mon - Sat: 9:00 AM - 6:00 PM'
                }
            ]
        }
    ],

    // Bottom Links (Privacy, Terms, etc.)
    bottomLinks: [
        {
            label: 'Privacy Policy',
            href: '/pages/privacy.html'
        },
        {
            label: 'Terms of Service',
            href: '/pages/terms.html'
        },
        {
            label: 'Cookie Policy',
            href: '/pages/cookies.html'
        }
    ],

    // Newsletter
    showNewsletter: true,
    onNewsletterSubmit: (email) => {
        // Custom newsletter handler
        console.log('Newsletter subscription:', email);

        // You can integrate with your backend here
        // Example: Send to API
        /*
        fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        .then(res => res.json())
        .then(data => {
          alert('Successfully subscribed!');
        })
        .catch(err => {
          alert('Subscription failed. Please try again.');
        });
        */

        alert(`Thank you for subscribing! We'll send updates to ${email}`);
    },

    // Copyright
    copyrightText: `© ${new Date().getFullYear()} MHMV. All rights reserved. | Excellence in Academic Performance`
};

// Initialize footer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const footer = new GlobalFooter(FOOTER_CONFIG);

    // Make footer instance globally available
    window.siteFooter = footer;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FOOTER_CONFIG };
}
