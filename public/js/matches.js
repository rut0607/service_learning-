document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const matchesContainer = document.getElementById('matches-container');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const matchesNav = document.getElementById('matches-nav');
    const matchesSection = document.getElementById('matches-section');
    
    // Format category name for display
    function formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    
    // Function to fetch matching events
    async function fetchMatchingEvents() {
        try {
            // Show loading spinner
            matchesContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading matched events...</p>
                </div>
            `;
            
            // Fetch matching events from API
            const response = await fetch('/api/matches', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch matching events');
            }
            
            const data = await response.json();
            
            // Render matching events
            renderMatchingEvents(data.data);
        } catch (error) {
            console.error('Error fetching matching events:', error);
            matchesContainer.innerHTML = `
                <div class="error">
                    <p>Error loading matched events. Please try again later.</p>
                </div>
            `;
        }
    }
    
    // Function to fetch recommendations
    async function fetchRecommendations() {
        try {
            // Show loading spinner
            recommendationsContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading recommendations...</p>
                </div>
            `;
            
            // Fetch recommendations from API
            const response = await fetch('/api/matches/recommendations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            
            const data = await response.json();
            
            // Render recommendations
            renderRecommendations(data.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            recommendationsContainer.innerHTML = `
                <div class="error">
                    <p>Error loading recommendations. Please try again later.</p>
                </div>
            `;
        }
    }
    
    // Function to render matching events
    function renderMatchingEvents(events) {
        // Clear container
        matchesContainer.innerHTML = '';
        
        if (events.length === 0) {
            matchesContainer.innerHTML = `
                <div class="no-events">
                    <p>No events found matching your interests.</p>
                    <p>Try updating your interests in your profile.</p>
                </div>
            `;
            return;
        }
        
        // Get the template
        const template = document.getElementById('event-card-template');
        
        // Create and append event cards
        events.forEach(event => {
            const eventCard = document.importNode(template.content, true);
            
            // Format date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Set content
            eventCard.querySelector('.event-date').textContent = formattedDate;
            eventCard.querySelector('.event-title').textContent = event.title;
            eventCard.querySelector('.event-description').textContent = event.description;
            eventCard.querySelector('.event-category').textContent = formatCategory(event.category);
            
            // Add location if available
            if (event.location) {
                const locationElement = document.createElement('p');
                locationElement.className = 'event-location';
                locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
                eventCard.querySelector('.event-card').appendChild(locationElement);
            }
            
            // Set link
            const link = eventCard.querySelector('.event-link');
            link.href = `/api/events/${event._id}`;
            link.setAttribute('data-id', event._id);
            
            matchesContainer.appendChild(eventCard);
        });
    }
    
    // Function to render recommendations
    function renderRecommendations(events) {
        // Clear container
        recommendationsContainer.innerHTML = '';
        
        if (events.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="no-events">
                    <p>No recommendations available at this time.</p>
                </div>
            `;
            return;
        }
        
        // Get the template
        const template = document.getElementById('event-card-template');
        
        // Create and append event cards
        events.forEach(event => {
            const eventCard = document.importNode(template.content, true);
            
            // Format date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Set content
            eventCard.querySelector('.event-date').textContent = formattedDate;
            eventCard.querySelector('.event-title').textContent = event.title;
            eventCard.querySelector('.event-description').textContent = event.description;
            eventCard.querySelector('.event-category').textContent = formatCategory(event.category);
            
            // Add location if available
            if (event.location) {
                const locationElement = document.createElement('p');
                locationElement.className = 'event-location';
                locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
                eventCard.querySelector('.event-card').appendChild(locationElement);
            }
            
            // Set link
            const link = eventCard.querySelector('.event-link');
            link.href = `/api/events/${event._id}`;
            link.setAttribute('data-id', event._id);
            
            recommendationsContainer.appendChild(eventCard);
        });
    }
    
    // Event Listeners
    if (matchesNav) {
        matchesNav.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide other sections
            document.querySelectorAll('main > section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show matches section
            matchesSection.classList.remove('hidden');
            
            // Update active nav
            document.querySelector('#header .navigation ul li a.active').classList.remove('active');
            this.classList.add('active');
            
            // Fetch data if user is logged in
            if (token) {
                fetchMatchingEvents();
                fetchRecommendations();
            } else {
                // Show login prompt
                matchesContainer.innerHTML = `
                    <div class="login-prompt">
                        <p>Please log in to see events matching your interests.</p>
                        <a href="/login.html" class="btn-primary">Log In</a>
                    </div>
                `;
                recommendationsContainer.innerHTML = '';
            }
        });
    }
    
    // Initialize if matches section is not hidden (user navigated directly)
    if (matchesSection && !matchesSection.classList.contains('hidden') && token) {
        fetchMatchingEvents();
        fetchRecommendations();
    }
});