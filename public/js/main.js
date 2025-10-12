// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Login Form Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            try {
                const res = await fetch('/api/v1/users/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await res.json();
                if (data.status === 'success') {
                    alert('Login successful! Redirecting...');
                    window.location.assign('/'); // Redirect to homepage
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.classList.remove('d-none');
                }
            } catch (err) {
                errorDiv.textContent = 'Something went wrong. Please try again.';
                errorDiv.classList.remove('d-none');
            }
        });
    }


    // --- Register Form Logic ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('register-error');

            // ใช้ FormData เพื่อให้ส่งไฟล์ได้
            const formData = new FormData();
            formData.append('firstName', document.getElementById('register-firstName').value);
            formData.append('lastName', document.getElementById('register-lastName').value);
            formData.append('username', document.getElementById('register-username').value);
            formData.append('email', document.getElementById('register-email').value);
            formData.append('password', document.getElementById('register-password').value);

            const imageFile = document.getElementById('profileImage').files[0];
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            try {
                // สำคัญ: เมื่อใช้ FormData กับ fetch, ห้ามตั้ง Content-Type header
                // browser จะจัดการให้เอง
                const res = await fetch('/api/v1/users/signup', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                if (data.status === 'success') {
                    alert('Registration successful! Please log in.');
                    window.location.reload(); // Reload to switch to login tab
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.classList.remove('d-none');
                }
            } catch (err) {
                errorDiv.textContent = 'Something went wrong. Please try again.';
                errorDiv.classList.remove('d-none');
            }
        });
    }

    // --- Image Preview Logic ---
    const profileImageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('image-preview');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('d-none');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch('/api/v1/users/logout', { method: 'GET' });
                const data = await res.json();
                if (data.status === 'success') {
                    location.assign('/'); // Redirect ไปหน้าแรก
                }
            } catch (err) {
                alert('Error logging out. Please try again.');
            }
        });
    }

    const eventDetailModal = document.getElementById('eventDetailModal');
    if (eventDetailModal) {
        const modalEventName = document.getElementById('modalEventName');
        const modalEventImage = document.getElementById('modalEventImage');
        const modalEventDate = document.getElementById('modalEventDate');
        const modalEventLocation = document.getElementById('modalEventLocation');
        const modalEventPrice = document.getElementById('modalEventPrice');
        const modalEventTickets = document.getElementById('modalEventTickets');
        const modalEventDescription = document.getElementById('modalEventDescription');
        const modalEventOrganizer = document.getElementById('modalEventOrganizer');
        const modalBookButton = document.getElementById('modalBookButton');

        eventDetailModal.addEventListener('show.bs.modal', async (event) => {
            const button = event.relatedTarget;
            const eventId = button.getAttribute('data-event-id');

            // Reset and show loading state
            modalEventName.textContent = 'Loading...';
            modalEventImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            // ... (Reset fields a-rest)

            try {
                const res = await fetch(`/api/v1/events/${eventId}`);
                const data = await res.json();
                if (data.status === 'success') {
                    const eventData = data.data.event;
                    modalEventName.textContent = eventData.name;
                    modalEventImage.src = eventData.imageUrl;
                    modalEventDate.textContent = new Date(eventData.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
                    modalEventLocation.textContent = eventData.location;
                    modalEventPrice.textContent = eventData.price.toLocaleString('en-US');
                    modalEventTickets.textContent = eventData.ticketAvailable;
                    modalEventDescription.textContent = eventData.description;
                    modalEventOrganizer.textContent = `${eventData.organizer.firstName} ${eventData.organizer.lastName}`;

                    const userRole = document.body.getAttribute('data-user-role');
                    if (userRole === 'attendee' && eventData.ticketAvailable > 0) {
                        modalBookButton.classList.remove('d-none');
                        modalBookButton.dataset.eventId = eventId;
                    } else {
                        modalBookButton.classList.add('d-none');
                    }
                } else {
                    modalEventName.textContent = 'Error: ' + data.message;
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                modalEventName.textContent = 'Error loading event details. Please check the console.';
            }
        });

        // Booking Button Logic
        modalBookButton.addEventListener('click', async (e) => {
            const eventId = e.target.dataset.eventId;
            if (!eventId) return;
            try {
                const res = await fetch('/api/v1/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    alert('Booking successful!');
                    location.reload();
                } else {
                    alert(`Booking failed: ${data.message}`);
                }
            } catch (err) {
                alert('An error occurred during booking. Please try again.');
            }
        });
    } 
}); 