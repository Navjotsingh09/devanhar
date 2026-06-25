// Mobile Testimonials Carousel - Smooth fade transition
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonials-dots .dot');
    let currentIndex = 0;
    let autoSlideInterval;
    let touchStartX = 0;
    let touchEndX = 0;
    const wrapper = document.querySelector('.testimonials-carousel-wrapper');
    
    // Only run on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    function updateCarousel() {
        if (!isMobile() || cards.length === 0) return;
        
        // Hide all cards, show only current
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    function nextSlide() {
        if (!isMobile()) return;
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }
    
    function prevSlide() {
        if (!isMobile()) return;
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetAutoSlide();
    }
    
    function startAutoSlide() {
        if (!isMobile()) return;
        autoSlideInterval = setInterval(nextSlide, 4000);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    // Touch/Swipe support
    if (wrapper) {
        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        wrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        if (!isMobile()) return;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoSlide();
        }
    }
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Initialize - only on mobile
    if (isMobile() && cards.length > 0) {
        cards[0].classList.add('active');
        updateCarousel();
        startAutoSlide();
    } else {
        // Desktop - ensure all cards visible, remove active class
        cards.forEach(card => {
            card.classList.remove('active');
        });
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
        if (isMobile()) {
            if (cards.length > 0 && !document.querySelector('.testimonial-card.active')) {
                cards[0].classList.add('active');
            }
            updateCarousel();
            if (!autoSlideInterval) startAutoSlide();
        } else {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
            // Show all cards on desktop
            cards.forEach(card => {
                card.classList.remove('active');
            });
        }
    });
});

// Mobile Menu Toggle with Scroll Lock
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const btnValuation = document.querySelector('.btn-valuation');
    const body = document.body;
    let scrollPosition = 0;
    
    function openMenu() {
        // Store scroll position before locking
        scrollPosition = window.pageYOffset;
        
        mobileMenuToggle.classList.add('active');
        navLinks.classList.add('active');
        if (btnValuation) {
            btnValuation.classList.add('active');
        }
        
        // Lock body scroll
        body.classList.add('menu-open');
        body.style.top = `-${scrollPosition}px`;
    }
    
    function closeMenu() {
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
        }
        if (navLinks) {
            navLinks.classList.remove('active');
        }
        if (btnValuation) {
            btnValuation.classList.remove('active');
        }
        
        // Unlock body scroll and restore position
        body.classList.remove('menu-open');
        body.style.top = '';
        window.scrollTo(0, scrollPosition);
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('active');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking on a nav link
        const navLinkItems = document.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close menu when clicking on valuation button
        if (btnValuation) {
            btnValuation.addEventListener('click', () => {
                closeMenu();
            });
        }

        // Close menu on window resize (if switching to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    }
});

// FAQ Accordion
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    const upArrow = '<svg viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.24264 1.8856L0.942813 5.18547L0 4.24267L4.24264 0L8.48531 4.24267L7.54251 5.18547L4.24264 1.8856Z" fill="white"/></svg>';
    const downArrow = '<svg viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.24264 4.11437L7.54251 0.814499L8.48531 1.7573L4.24264 5.99997L0 1.7573L0.942813 0.814499L4.24264 4.11437Z" fill="#2a363a"/></svg>';
    
    // Initialize arrows on page load
    faqItems.forEach(item => {
        const toggle = item.querySelector('.faq-toggle');
        if (toggle) {
            if (item.classList.contains('active')) {
                toggle.innerHTML = upArrow;
            } else {
                toggle.innerHTML = downArrow;
            }
        }
    });
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all items
                faqItems.forEach(i => {
                    i.classList.remove('active');
                    const faqToggle = i.querySelector('.faq-toggle');
                    if (faqToggle) {
                        faqToggle.innerHTML = downArrow;
                    }
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    if (toggle) {
                        toggle.innerHTML = upArrow;
                    }
                }
            });
        }
    });
});

// Footer Accordion for Mobile
document.addEventListener('DOMContentLoaded', function() {
    const footerAccordionItems = document.querySelectorAll('.footer-accordion-item');
    
    footerAccordionItems.forEach(item => {
        const header = item.querySelector('.footer-accordion-header');
        
        if (header) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all items
                footerAccordionItems.forEach(i => {
                    i.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Property Search Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Homepage Filter - Redirect to Listings with query params
    const homeSearchBtn = document.getElementById('home-search-btn');
    const homeFilterPayment = document.getElementById('home-filter-payment');
    const homeFilterLocation = document.getElementById('home-filter-location');
    const homeFilterType = document.getElementById('home-filter-type');
    const homeFilterBedrooms = document.getElementById('home-filter-bedrooms');
    const homeFilterPrice = document.getElementById('home-filter-price');
    
    if (homeSearchBtn) {
        homeSearchBtn.addEventListener('click', function() {
            const params = new URLSearchParams();
            
            if (homeFilterPayment && homeFilterPayment.value !== 'all') {
                params.set('payment', homeFilterPayment.value);
            }
            if (homeFilterLocation && homeFilterLocation.value !== 'all') {
                params.set('location', homeFilterLocation.value);
            }
            if (homeFilterType && homeFilterType.value !== 'all') {
                params.set('type', homeFilterType.value);
            }
            if (homeFilterBedrooms && homeFilterBedrooms.value !== 'all') {
                params.set('bedrooms', homeFilterBedrooms.value);
            }
            if (homeFilterPrice && homeFilterPrice.value !== 'all') {
                params.set('price', homeFilterPrice.value);
            }
            
            const queryString = params.toString();
            const url = queryString ? `listings.html?${queryString}` : 'listings.html';
            window.location.href = url;
        });
    }
    
    // Listings Page Filter
    const searchBtn = document.getElementById('search-btn');
    const filterPayment = document.getElementById('filter-payment');
    const filterLocation = document.getElementById('filter-location');
    const filterType = document.getElementById('filter-type');
    const filterBedrooms = document.getElementById('filter-bedrooms');
    const filterPrice = document.getElementById('filter-price');
    const filterStatus = document.getElementById('filter-status');
    const propertyCards = document.querySelectorAll('.property-listing-card');
    const noResults = document.getElementById('no-results');
    
    // Only run listings filter logic on listings page
    if (!searchBtn || !propertyCards.length) return;
    
    // Read URL parameters and set filter values
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('payment') && filterPayment) {
        filterPayment.value = urlParams.get('payment');
    }
    if (urlParams.has('location') && filterLocation) {
        filterLocation.value = urlParams.get('location');
    }
    if (urlParams.has('type') && filterType) {
        filterType.value = urlParams.get('type');
    }
    if (urlParams.has('bedrooms') && filterBedrooms) {
        filterBedrooms.value = urlParams.get('bedrooms');
    }
    if (urlParams.has('price') && filterPrice) {
        filterPrice.value = urlParams.get('price');
    }
    if (urlParams.has('status') && filterStatus) {
        filterStatus.value = urlParams.get('status');
    }
    
    function filterProperties() {
        const payment = filterPayment ? filterPayment.value : 'all';
        const location = filterLocation ? filterLocation.value : 'all';
        const type = filterType ? filterType.value : 'all';
        const bedrooms = filterBedrooms ? filterBedrooms.value : 'all';
        const maxPrice = filterPrice ? filterPrice.value : 'all';
        const status = filterStatus ? filterStatus.value : 'all';
        
        let visibleCount = 0;
        
        propertyCards.forEach(card => {
            const cardPayment = card.dataset.payment;
            const cardLocation = card.dataset.location;
            const cardType = card.dataset.type;
            const cardBedrooms = parseInt(card.dataset.bedrooms);
            const cardPrice = parseInt(card.dataset.price);
            const cardStatus = card.dataset.status;
            
            let show = true;
            
            // Payment filter
            if (payment !== 'all' && cardPayment !== payment) {
                show = false;
            }
            
            // Location filter
            if (location !== 'all' && cardLocation !== location) {
                show = false;
            }
            
            // Property Type filter
            if (type !== 'all' && cardType !== type) {
                show = false;
            }
            
            // Bedrooms filter (minimum bedrooms)
            if (bedrooms !== 'all' && cardBedrooms < parseInt(bedrooms)) {
                show = false;
            }
            
            // Price filter (maximum price)
            if (maxPrice !== 'all' && cardPrice > parseInt(maxPrice)) {
                show = false;
            }
            
            // Status filter (available/sold)
            if (status !== 'all' && cardStatus !== status) {
                show = false;
            }
            
            // Show or hide card
            if (show) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Show/hide no results message
        if (noResults) {
            if (visibleCount === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    }
    
    // Apply filters if URL has parameters (from homepage search)
    if (window.location.search) {
        filterProperties();
    }
    
    // Search button click
    searchBtn.addEventListener('click', filterProperties);
    
    // Also filter on dropdown change
    const filters = [filterPayment, filterLocation, filterType, filterBedrooms, filterPrice, filterStatus];
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterProperties);
        }
    });
});

// School Checker Form
document.addEventListener('DOMContentLoaded', function() {
    const schoolSearchForm = document.getElementById('schoolSearchForm');
    const postcodeInput = document.getElementById('postcodeInput');
    const schoolSearchMsg = document.getElementById('schoolSearchMsg');
    
    if (schoolSearchForm) {
        schoolSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const postcode = postcodeInput.value.trim();
            if (!postcode) return;
            
            // UK Government school search URL
            const url = `https://get-information-schools.service.gov.uk/Search?SearchType=Location&LocationSearchModel.Text=${encodeURIComponent(postcode)}`;
            
            // Try to open in new window
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            // Handle popup blocked scenario
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                if (schoolSearchMsg) {
                    schoolSearchMsg.innerHTML = `Popup was blocked. <a href="${url}" target="_blank" rel="noopener noreferrer">Click here to search for schools</a>`;
                    schoolSearchMsg.classList.add('visible');
                }
            }
        });
    }
});

// Valuation Modal Popup
document.addEventListener('DOMContentLoaded', function() {
    const valuationModal = document.getElementById('valuationModal');
    const valuationBtns = document.querySelectorAll('.btn-valuation');
    const modalClose = document.querySelector('.valuation-modal-close');
    const modalOverlay = document.querySelector('.valuation-modal-overlay');
    const valuationForm = document.getElementById('valuationForm');
    
    // Open modal when clicking Book a Valuation button
    valuationBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (valuationModal) {
                valuationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal functions
    function closeModal() {
        if (valuationModal) {
            valuationModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Close on X button click
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && valuationModal && valuationModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Handle valuation form submission
    if (valuationForm) {
        valuationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(valuationForm);
            const submitBtn = valuationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            
            fetch('https://formsubmit.co/ajax/navjot.singh@5rv.digital', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Thank you! Your valuation request has been submitted. We will contact you soon.');
                    closeModal();
                    valuationForm.reset();
                } else {
                    alert('There was an error submitting the form. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting the form. Please try again.');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

// Newsletter Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('.newsletter-input');
            const submitBtn = form.querySelector('.newsletter-btn');
            const originalText = submitBtn.textContent;
            
            if (!emailInput.value) return;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            const formData = new FormData();
            formData.append('email', emailInput.value);
            formData.append('_subject', 'New Newsletter Subscription - Halle Properties');
            
            fetch('https://formsubmit.co/ajax/navjot.singh@5rv.digital', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Thank you for subscribing to our newsletter!');
                    emailInput.value = '';
                } else {
                    alert('There was an error subscribing. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error subscribing. Please try again.');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    });
});

// Contact Form Submission (for AJAX handling)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            
            fetch('https://formsubmit.co/ajax/navjot.singh@5rv.digital', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                } else {
                    alert('There was an error sending your message. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error sending your message. Please try again.');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

// Blog Pagination
document.addEventListener('DOMContentLoaded', function() {
    const paginationBtns = document.querySelectorAll('.blog-pagination .pagination-btn');
    const blogPages = document.querySelectorAll('.blog-page');
    
    if (paginationBtns.length === 0 || blogPages.length === 0) return;
    
    let currentPage = 1;
    const totalPages = blogPages.length;
    let isTransitioning = false;
    
    function showPage(pageNum) {
        if (isTransitioning || pageNum === currentPage) return;
        isTransitioning = true;
        
        const currentPageEl = document.querySelector(`.blog-page[data-page="${currentPage}"]`);
        const targetPageEl = document.querySelector(`.blog-page[data-page="${pageNum}"]`);
        
        if (!targetPageEl) {
            isTransitioning = false;
            return;
        }
        
        // Fade out current page
        if (currentPageEl) {
            currentPageEl.classList.add('fade-out');
        }
        
        // After fade out, switch pages
        setTimeout(() => {
            // Hide current page
            if (currentPageEl) {
                currentPageEl.classList.add('hidden');
                currentPageEl.classList.remove('fade-out');
            }
            
            // Show target page (initially faded out)
            targetPageEl.classList.remove('hidden');
            targetPageEl.classList.add('fade-out');
            
            // Force reflow to ensure transition works
            targetPageEl.offsetHeight;
            
            // Fade in target page
            targetPageEl.classList.remove('fade-out');
            
            // Update button states
            paginationBtns.forEach(btn => {
                btn.classList.remove('active');
                const btnPage = btn.getAttribute('data-page');
                if (btnPage && parseInt(btnPage) === pageNum) {
                    btn.classList.add('active');
                }
            });
            
            currentPage = pageNum;
            
            // Scroll to top of blog section
            const blogSection = document.querySelector('.blog-cards-section');
            if (blogSection) {
                blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Reset transitioning flag after fade in completes
            setTimeout(() => {
                isTransitioning = false;
            }, 400);
        }, 400);
    }
    
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const pageNum = this.getAttribute('data-page');
            
            if (action === 'next') {
                if (currentPage < totalPages) {
                    showPage(currentPage + 1);
                }
            } else if (pageNum) {
                showPage(parseInt(pageNum));
            }
        });
    });
});

// Blog Search and Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('blogSearchInput');
    const searchBtn = document.getElementById('blogSearchBtn');
    const filterTags = document.querySelectorAll('.filter-tag');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const blogCardsContainer = document.querySelector('.blog-cards-container');
    const paginationSection = document.querySelector('.blog-pagination-section');
    
    if (!searchInput || !blogCardsContainer) return;
    
    // Get all blog cards
    const allBlogCards = document.querySelectorAll('.blog-card');
    let activeFilter = 'all';
    let searchQuery = '';
    let isSearchActive = false;
    
    // Create a container for search results
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.className = 'blog-search-results';
    searchResultsContainer.style.display = 'none';
    blogCardsContainer.parentNode.insertBefore(searchResultsContainer, blogCardsContainer);
    
    // Create no results message
    const noResultsMessage = document.createElement('div');
    noResultsMessage.className = 'no-results-message';
    noResultsMessage.style.display = 'none';
    noResultsMessage.innerHTML = `
        <h3>No results found</h3>
        <p>Try adjusting your search or filter to find what you're looking for.</p>
    `;
    blogCardsContainer.parentNode.insertBefore(noResultsMessage, blogCardsContainer);
    
    // Function to get card data
    function getCardData(card) {
        const title = card.querySelector('.blog-card-title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.blog-card-excerpt')?.textContent.toLowerCase() || '';
        const category = card.getAttribute('data-category')?.toLowerCase() || '';
        return { title, excerpt, category, element: card };
    }
    
    // Function to perform search and filter
    function performSearchAndFilter() {
        const query = searchQuery.toLowerCase().trim();
        const filter = activeFilter.toLowerCase();
        
        let matchingCards = [];
        
        allBlogCards.forEach(card => {
            const data = getCardData(card);
            
            // Check category filter
            let categoryMatch = filter === 'all' || data.category === filter;
            
            // Check search query
            let searchMatch = query === '' || 
                data.title.includes(query) || 
                data.excerpt.includes(query);
            
            if (categoryMatch && searchMatch) {
                matchingCards.push(card);
            }
        });
        
        // Show/hide search results
        // Always show paginated results when filtering or searching
        if (filter === 'all' && query === '') {
            isSearchActive = true;
            showPaginatedResults(matchingCards, query, filter);
        } else if (query !== '' || filter !== 'all') {
            isSearchActive = true;
            showPaginatedResults(matchingCards, query, filter);
        } else {
            isSearchActive = false;
            hideSearchResults();
        }
    }
    
    // Function to show paginated results (6 per page)
    function showPaginatedResults(cards, query, filter) {
        const cardsPerPage = 6;
        const totalPages = Math.ceil(cards.length / cardsPerPage);
        let currentResultPage = 1;
        
        // Hide original blog pages
        document.querySelectorAll('.blog-page').forEach(page => {
            page.style.display = 'none';
        });
        
        // Clear search results container
        searchResultsContainer.innerHTML = '';
        
        if (cards.length === 0) {
            noResultsMessage.style.display = 'block';
            searchResultsContainer.style.display = 'none';
            if (paginationSection) {
                paginationSection.style.display = 'none';
            }
            searchResultsInfo.classList.add('visible');
            searchResultsInfo.innerHTML = `No results found${query ? ' for "<strong>' + escapeHtml(query) + '</strong>"' : ''}${filter !== 'all' ? ' in <strong>' + capitalizeFirst(filter) + '</strong>' : ''}`;
            return;
        }
        
        noResultsMessage.style.display = 'none';
        searchResultsContainer.style.display = 'flex';
        searchResultsContainer.style.flexWrap = 'wrap';
        searchResultsContainer.style.gap = '20px';
        searchResultsContainer.style.justifyContent = 'flex-start';
        
        // Function to render a page of results
        function renderPage(pageNum) {
            searchResultsContainer.innerHTML = '';
            const startIndex = (pageNum - 1) * cardsPerPage;
            const endIndex = Math.min(startIndex + cardsPerPage, cards.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const clone = cards[i].cloneNode(true);
                searchResultsContainer.appendChild(clone);
            }
            
            currentResultPage = pageNum;
            updatePaginationUI(pageNum, totalPages);
        }
        
        // Function to update pagination UI
        function updatePaginationUI(currentPage, totalPages) {
            if (paginationSection) {
                const paginationContainer = paginationSection.querySelector('.blog-pagination');
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                    
                    // Create page buttons
                    for (let i = 1; i <= totalPages; i++) {
                        const btn = document.createElement('button');
                        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
                        btn.setAttribute('data-page', i);
                        btn.textContent = i;
                        btn.addEventListener('click', () => {
                            renderPage(i);
                            window.scrollTo({ top: searchResultsContainer.offsetTop - 100, behavior: 'smooth' });
                        });
                        paginationContainer.appendChild(btn);
                    }
                    
                    // Add next button if more than 1 page
                    if (totalPages > 1) {
                        const nextBtn = document.createElement('button');
                        nextBtn.className = 'pagination-btn pagination-next';
                        nextBtn.setAttribute('data-action', 'next');
                        nextBtn.innerHTML = '&gt;';
                        nextBtn.addEventListener('click', () => {
                            if (currentResultPage < totalPages) {
                                renderPage(currentResultPage + 1);
                                window.scrollTo({ top: searchResultsContainer.offsetTop - 100, behavior: 'smooth' });
                            }
                        });
                        paginationContainer.appendChild(nextBtn);
                    }
                }
                paginationSection.style.display = totalPages > 1 ? 'flex' : 'none';
            }
        }
        
        // Show results info only for search/filter (not for 'All')
        if (query !== '' || filter !== 'all') {
            searchResultsInfo.classList.add('visible');
            let infoText = `Found <strong>${cards.length}</strong> result${cards.length !== 1 ? 's' : ''}`;
            if (query) {
                infoText += ` for "<strong>${escapeHtml(query)}</strong>"`;
            }
            if (filter !== 'all') {
                infoText += ` in <strong>${capitalizeFirst(filter)}</strong>`;
            }
            searchResultsInfo.innerHTML = infoText;
        } else {
            searchResultsInfo.classList.remove('visible');
        }
        
        // Render first page
        renderPage(1);
    }

    // Function to show search results (kept for backwards compatibility)
    function showSearchResults(cards, query, filter) {
        // Hide original blog pages and pagination
        document.querySelectorAll('.blog-page').forEach(page => {
            page.style.display = 'none';
        });
        if (paginationSection) {
            paginationSection.style.display = 'none';
        }
        
        // Clear and populate search results container
        searchResultsContainer.innerHTML = '';
        
        if (cards.length === 0) {
            noResultsMessage.style.display = 'block';
            searchResultsContainer.style.display = 'none';
            searchResultsInfo.classList.add('visible');
            searchResultsInfo.innerHTML = `No results found${query ? ' for "<strong>' + escapeHtml(query) + '</strong>"' : ''}${filter !== 'all' ? ' in <strong>' + capitalizeFirst(filter) + '</strong>' : ''}`;
        } else {
            noResultsMessage.style.display = 'none';
            searchResultsContainer.style.display = 'flex';
            searchResultsContainer.style.flexWrap = 'wrap';
            searchResultsContainer.style.gap = '20px';
            searchResultsContainer.style.justifyContent = 'flex-start';
            
            // Clone and append matching cards
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                searchResultsContainer.appendChild(clone);
            });
            
            // Show results count
            searchResultsInfo.classList.add('visible');
            let infoText = `Found <strong>${cards.length}</strong> result${cards.length !== 1 ? 's' : ''}`;
            if (query) {
                infoText += ` for "<strong>${escapeHtml(query)}</strong>"`;
            }
            if (filter !== 'all') {
                infoText += ` in <strong>${capitalizeFirst(filter)}</strong>`;
            }
            searchResultsInfo.innerHTML = infoText;
        }
    }
    
    // Function to hide search results
    function hideSearchResults() {
        searchResultsContainer.style.display = 'none';
        noResultsMessage.style.display = 'none';
        searchResultsInfo.classList.remove('visible');
        
        // Show original blog pages and pagination
        document.querySelectorAll('.blog-page').forEach((page, index) => {
            page.style.display = index === 0 ? 'flex' : 'none';
            if (index === 0) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
        if (paginationSection) {
            paginationSection.style.display = 'flex';
        }
    }
    
    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Event listeners for search
    searchBtn.addEventListener('click', function() {
        searchQuery = searchInput.value;
        performSearchAndFilter();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value;
            performSearchAndFilter();
        }
    });
    
    // Live search on input (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value;
            performSearchAndFilter();
        }, 300);
    });
    
    // Event listeners for filter tags
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            this.classList.add('active');
            // Update active filter
            activeFilter = this.getAttribute('data-category') || 'all';
            // Perform search and filter
            performSearchAndFilter();
        });
    });
    
    // Trigger 'All' filter on page load to show all blogs
    performSearchAndFilter();
});

// Mobile Buy/Rent Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileFilterTabs = document.querySelectorAll('.mobile-filter-tab');
    const mobileFilterLabel = document.querySelector('.mobile-filter-label');
    
    if (mobileFilterTabs.length > 0 && mobileFilterLabel) {
        mobileFilterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                mobileFilterTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Update the search label based on selected tab
                const type = this.getAttribute('data-type');
                if (type === 'buy') {
                    mobileFilterLabel.textContent = 'Search Properties to buy';
                } else if (type === 'rent') {
                    mobileFilterLabel.textContent = 'Search Properties to rent';
                }
            });
        });
    }
    
    // Mobile search button functionality
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    const mobileSearchInput = document.querySelector('.mobile-search-input');
    
    if (mobileSearchBtn && mobileSearchInput) {
        mobileSearchBtn.addEventListener('click', function() {
            const searchValue = mobileSearchInput.value.trim();
            const activeTab = document.querySelector('.mobile-filter-tab.active');
            const searchType = activeTab ? activeTab.getAttribute('data-type') : 'buy';
            
            // Get mobile filter values if they exist
            const mobilePayment = document.getElementById('mobile-filter-payment');
            const mobileLocation = document.getElementById('mobile-filter-location');
            const mobileType = document.getElementById('mobile-filter-type');
            const mobileBedrooms = document.getElementById('mobile-filter-bedrooms');
            const mobilePrice = document.getElementById('mobile-filter-price');
            
            const params = new URLSearchParams();
            
            // Add search type (buy/rent)
            params.set('payment', searchType === 'buy' ? 'sale' : 'rent');
            
            // Add location search
            if (searchValue) {
                params.set('location', searchValue);
            }
            
            // Add filter values if set
            if (mobilePayment && mobilePayment.value !== 'all') {
                params.set('payment', mobilePayment.value);
            }
            if (mobileLocation && mobileLocation.value !== 'all') {
                params.set('location', mobileLocation.value);
            }
            if (mobileType && mobileType.value !== 'all') {
                params.set('type', mobileType.value);
            }
            if (mobileBedrooms && mobileBedrooms.value !== 'all') {
                params.set('bedrooms', mobileBedrooms.value);
            }
            if (mobilePrice && mobilePrice.value !== 'all') {
                params.set('price', mobilePrice.value);
            }
            
            const queryString = params.toString();
            window.location.href = `listings.html?${queryString}`;
        });
        
        // Allow Enter key to trigger search
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                mobileSearchBtn.click();
            }
        });
    }
    
    // Mobile Filter Modal Functionality
    const mobileFilterIcon = document.querySelector('.mobile-filter-icon');
    const mobileFilterModal = document.getElementById('mobile-filter-modal');
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    const mobileFilterReset = document.getElementById('mobile-filter-reset');
    const mobileFilterApply = document.getElementById('mobile-filter-apply');
    
    if (mobileFilterIcon && mobileFilterModal) {
        // Open modal when filter icon clicked
        mobileFilterIcon.addEventListener('click', function(e) {
            e.preventDefault();
            mobileFilterModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        // Close modal when X clicked
        if (mobileFilterClose) {
            mobileFilterClose.addEventListener('click', function() {
                mobileFilterModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Close modal when clicking overlay
        mobileFilterModal.addEventListener('click', function(e) {
            if (e.target === mobileFilterModal) {
                mobileFilterModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Reset filters
        if (mobileFilterReset) {
            mobileFilterReset.addEventListener('click', function() {
                const selects = mobileFilterModal.querySelectorAll('select');
                selects.forEach(select => {
                    select.value = 'all';
                });
            });
        }
        
        // Apply filters and search
        if (mobileFilterApply) {
            mobileFilterApply.addEventListener('click', function() {
                const mobilePayment = document.getElementById('mobile-filter-payment');
                const mobileLocation = document.getElementById('mobile-filter-location');
                const mobileType = document.getElementById('mobile-filter-type');
                const mobileBedrooms = document.getElementById('mobile-filter-bedrooms');
                const mobilePrice = document.getElementById('mobile-filter-price');
                const mobileSearchInput = document.querySelector('.mobile-search-input');
                
                const params = new URLSearchParams();
                
                // Add search input value as location if present
                if (mobileSearchInput && mobileSearchInput.value.trim()) {
                    params.set('search', mobileSearchInput.value.trim());
                }
                
                if (mobilePayment && mobilePayment.value !== 'all') {
                    params.set('payment', mobilePayment.value);
                }
                if (mobileLocation && mobileLocation.value !== 'all') {
                    params.set('location', mobileLocation.value);
                }
                if (mobileType && mobileType.value !== 'all') {
                    params.set('type', mobileType.value);
                }
                if (mobileBedrooms && mobileBedrooms.value !== 'all') {
                    params.set('bedrooms', mobileBedrooms.value);
                }
                if (mobilePrice && mobilePrice.value !== 'all') {
                    params.set('price', mobilePrice.value);
                }
                
                const queryString = params.toString();
                const url = queryString ? `listings.html?${queryString}` : 'listings.html';
                window.location.href = url;
            });
        }
    }
});

// Mobile Property Carousel
document.addEventListener('DOMContentLoaded', function() {
    const propertyCards = document.querySelectorAll('.properties-grid .property-card');
    const prevBtn = document.querySelector('.property-nav-arrow.prev');
    const nextBtn = document.querySelector('.property-nav-arrow.next');
    
    if (propertyCards.length === 0 || !prevBtn || !nextBtn) return;
    
    // Only activate on mobile
    if (window.innerWidth > 768) return;
    
    let currentIndex = 0;
    const totalCards = propertyCards.length;
    
    // Initialize - set first card as active
    function initCarousel() {
        propertyCards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            if (index === currentIndex) {
                card.classList.add('active');
            } else if (index < currentIndex) {
                card.classList.add('prev');
            } else {
                card.classList.add('next');
            }
        });
    }
    
    // Go to next card
    function nextCard() {
        if (currentIndex < totalCards - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop back to first
        }
        initCarousel();
    }
    
    // Go to previous card
    function prevCard() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalCards - 1; // Loop to last
        }
        initCarousel();
    }
    
    // Initialize on load
    initCarousel();
    
    // Event listeners
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);
    
    // Re-initialize on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            initCarousel();
        } else {
            // Reset all cards for desktop
            propertyCards.forEach(card => {
                card.classList.remove('active', 'prev', 'next');
            });
        }
    });
});