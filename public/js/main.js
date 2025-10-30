document.addEventListener('DOMContentLoaded', function() {
    // Function to handle notification sending
    function sendNotification(event) {
        event.preventDefault();
        
        var title = document.getElementById('event-title').value;
        var date = document.getElementById('event-date').value;
        var message = document.getElementById('event-message').value;
        var notifyAll = document.getElementById('notify-all').checked;
        
        var checkboxes = document.querySelectorAll('input[name="interests"]:checked');
        var selectedInterests = [];
        for (var i = 0; i < checkboxes.length; i++) {
            selectedInterests.push(checkboxes[i].value);
        }
        
        if (!title || !date || !message) {
            alert('Please fill in all required fields');
            return;
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/events/notifications/send', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Notifications sent successfully!');
                    document.getElementById('notification-form').reset();
                } else {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        alert('Failed to send notifications: ' + (data.message || 'Unknown error'));
                    } catch (e) {
                        alert('Failed to send notifications. Please try again.');
                    }
                }
            }
        };
        
        xhr.onerror = function() {
            console.error('Error sending notifications');
            alert('Failed to send notifications. Please try again.');
        };
        
        xhr.send(JSON.stringify({
            title: title,
            date: date,
            message: message,
            notifyAll: notifyAll,
            interests: selectedInterests
        }));
    }
    // DOM Elements
    const eventsContainer = document.getElementById('events-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const subscribeNav = document.getElementById('subscribe-nav');
    const aboutNav = document.getElementById('about-nav');
    const matchesNav = document.getElementById('matches-nav');
    const subscribeSection = document.getElementById('subscribe-section');
    const aboutSection = document.getElementById('about-section');
    const matchesSection = document.getElementById('matches-section');
    const subscribeForm = document.getElementById('subscribe-form');
    const notifySection = document.getElementById('notify-section');
    const notificationForm = document.getElementById('notification-form');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    
    // Add login/logout button to navigation
    const navUl = document.querySelector('#header .navigation ul');
    const authLi = document.createElement('li');
    const authLink = document.createElement('a');
    authLink.href = isLoggedIn ? '#' : 'login.html';
    authLink.textContent = isLoggedIn ? 'Logout' : 'Login';
    authLink.id = isLoggedIn ? 'logout-nav' : 'login-nav';
    authLi.appendChild(authLink);
    navUl.appendChild(authLi);
    
    // Add event listener for logout
    if (isLoggedIn) {
        document.getElementById('logout-nav').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.reload();
        });
    }
    
    // State
    let events = [];
    let filteredEvents = [];
    let currentFilter = 'all';
    let searchTerm = '';
    
    // Fetch events from API
    function fetchEvents() {
        eventsContainer.innerHTML = '<div class="loading-message"><p>Loading events...</p></div>';
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/events', true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        events = JSON.parse(xhr.responseText);
                        filteredEvents = [...events];
                        renderEvents();
                    } catch (e) {
                        console.error('Error parsing events:', e);
                        eventsContainer.innerHTML = '<div class="error"><p>Failed to load events. Please try again later.</p></div>';
                    }
                } else {
                    eventsContainer.innerHTML = '<div class="error"><p>Failed to load events. Please try again later.</p></div>';
                }
            }
        };
        
        xhr.onerror = function() {
            console.error('Error fetching events');
            eventsContainer.innerHTML = '<div class="error"><p>Failed to load events. Please try again later.</p></div>';
        };
        
        xhr.send();
    }
    
    // Render events to the DOM
    function renderEvents() {
        // Clear loading spinner
        eventsContainer.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events">
                    <p>No events found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        // Get the template
        const template = document.getElementById('event-card-template');
        
        // Create and append event cards
        filteredEvents.forEach(event => {
            const eventCard = document.importNode(template.content, true);
            
            // Format date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Set content
            eventCard.querySelector('.event-date').textContent = formattedDate;
            eventCard.querySelector('.event-title').textContent = event.title;
            eventCard.querySelector('.event-description').textContent = event.description;
            eventCard.querySelector('.event-category').textContent = formatCategory(event.category);
            
            // Set link
            const link = eventCard.querySelector('.event-link');
            link.href = `/api/events/${event._id}`;
            link.setAttribute('data-id', event._id);
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showEventDetails(event._id);
            });
            
            eventsContainer.appendChild(eventCard);
        });
    }
    
    // Format category name for display
    function formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Show event details (could be expanded to a modal or separate page)
    function showEventDetails(eventId) {
        const event = events.find(e => e._id === eventId);
        if (!event) return;
        
        alert(`
            Event: ${event.title}\n
            Date: ${new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n
            Category: ${formatCategory(event.category)}\n
            Description: ${event.description}\n
            This is a placeholder for a detailed event view.
        `);
    }
    
    // Filter events by category
    function filterEvents() {
        if (currentFilter === 'all' && searchTerm === '') {
            filteredEvents = [...events];
        } else {
            filteredEvents = events.filter(event => {
                const matchesCategory = currentFilter === 'all' || event.category === currentFilter;
                const matchesSearch = searchTerm === '' || 
                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchTerm.toLowerCase());
                
                return matchesCategory && matchesSearch;
            });
        }
        
        renderEvents();
    }
    
    // Event Listeners
    
    // Category filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update filter
            currentFilter = this.getAttribute('data-category');
            
            // Apply filters
            filterEvents();
        });
    });
    
    // Search functionality
    searchBtn.addEventListener('click', function() {
        searchTerm = searchInput.value.trim();
        filterEvents();
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchTerm = searchInput.value.trim();
            filterEvents();
        }
    });
    
    // Add notification form event listener if it exists
    if (notificationForm) {
        notificationForm.addEventListener('submit', sendNotification);
    }
    
    // Direct notification button functionality
    const directNotifyBtn = document.getElementById('direct-notify-btn');
    if (directNotifyBtn) {
        directNotifyBtn.addEventListener('click', async () => {
            try {
                directNotifyBtn.disabled = true;
                directNotifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                const resp = await fetch('/api/events/notifications/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        title: 'ISKCON NVCC Digest',
                        date: new Date().toISOString().split('T')[0],
                        message: 'Hare Krishna! Please find the latest updates and upcoming events on our website.',
                        notifyAll: true
                    })
                });
                const data = await resp.json();
                if (resp.ok) {
                    alert(`Digest sent successfully to ${data.userCount || 'users'}.`);
                } else {
                    alert(data.message || 'Failed to send digest.');
                }
            } catch (e) {
                alert('Network error. Please try again.');
            } finally {
                directNotifyBtn.disabled = false;
                directNotifyBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Direct Notification';
            }
        });
    }

    // Navbar "Send Mail" button functionality
    const sendMailNav = document.getElementById('send-mail-nav');
    if (sendMailNav) {
        sendMailNav.addEventListener('click', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login as admin to send mail.');
                window.location.href = 'login.html';
                return;
            }
            const confirmSend = confirm('Send digest email to all users now?');
            if (!confirmSend) return;
            try {
                sendMailNav.textContent = 'Sending…';
                const resp = await fetch('/api/events/notifications/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: 'ISKCON NVCC Digest',
                        date: new Date().toISOString().split('T')[0],
                        message: 'Hare Krishna! Here are the latest updates and upcoming events at ISKCON NVCC Pune.',
                        notifyAll: true
                    })
                });
                const data = await resp.json();
                if (resp.ok) {
                    alert(`Mail sent successfully to ${data.userCount || 'users'}.`);
                } else {
                    alert(data.message || 'Failed to send mail.');
                }
            } catch (err) {
                alert('Network error while sending mail.');
            } finally {
                sendMailNav.textContent = 'Send Mail';
            }
        });
    }
    
    // Navigation
    subscribeNav.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Hide events section and about section
        document.querySelector('.events').classList.add('hidden');
        document.querySelector('.filters').classList.add('hidden');
        aboutSection.classList.add('hidden');
        
        // Show subscribe section
        subscribeSection.classList.remove('hidden');
        
        // Update active nav
        document.querySelector('#header .navigation ul li a.active').classList.remove('active');
        this.classList.add('active');
    });
    
    aboutNav.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Hide events section and subscribe section
        document.querySelector('.events-list').classList.add('hidden');
        document.querySelector('.filters').classList.add('hidden');
        subscribeSection.classList.add('hidden');
        
        // Show about section
        aboutSection.classList.remove('hidden');
        
        // Update active nav
        document.querySelector('#header .navigation ul li a.active').classList.remove('active');
        this.classList.add('active');
    });
    
    // Return to events view
    document.querySelector('#header .navigation ul li a').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Show events section
        document.querySelector('.events-list').classList.remove('hidden');
        document.querySelector('.filters').classList.remove('hidden');
        
        // Hide other sections
        subscribeSection.classList.add('hidden');
        aboutSection.classList.add('hidden');
        
        // Update active nav
        document.querySelector('#header .navigation ul li a.active').classList.remove('active');
        this.classList.add('active');
    });
    
    // Subscribe form submission
    subscribeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
        const interests = Array.from(interestCheckboxes).map(cb => cb.value);
        
        // Validate form
        if (!name || !email || interests.length === 0) {
            alert('Please fill out all fields and select at least one interest.');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            // Send data to server
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, interests })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success message
                alert(`Thank you for subscribing, ${name}! You will receive notifications about ${interests.join(', ')} events.`);
                // Reset form
                this.reset();
            } else {
                // Show error message
                alert(`Error: ${data.message || 'Something went wrong. Please try again.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while subscribing. Please try again.');
        } finally {
            // Reset button state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Subscribe';
            submitBtn.disabled = false;
        }
    });
    
    // Initialize
    fetchEvents();
});