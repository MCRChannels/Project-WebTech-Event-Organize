let countdownInterval;

async function bookEvent(eventId) {
    try {
        const res = await fetch('/api/v1/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId })
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert('Booking successful! Your ticket is now in "My Bookings".');
            window.location.assign('/my-bookings');
        } else {
            alert(`Booking failed: ${data.message}`);
        }
    } catch (err) {
        alert('An error occurred during booking. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // --- BLOCK 1: AUTHENTICATION & PROFILE ---
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
                    window.location.assign('/');
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

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('register-error');
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
                const res = await fetch('/api/v1/users/signup', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.status === 'success') {
                    alert('Registration successful! Please log in.');
                    window.location.reload();
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

    const profileImageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('image-preview');
    if (profileImageInput && imagePreview) {
        profileImageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
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
                if (data.status === 'success') location.assign('/');
            } catch (err) {
                alert('Error logging out.');
            }
        });
    }

    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {

        // ▼▼▼ เพิ่ม Logic สำหรับ Preview รูปใหม่ ▼▼▼
        const newProfileImageInput = document.getElementById('newProfileImage');
        const imagePreview = document.getElementById('profile-image-preview'); // หาจาก ID ใหม่
        if (newProfileImageInput && imagePreview) {
            newProfileImageInput.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // เมื่ออ่านไฟล์เสร็จ ให้เปลี่ยน src ของรูปพรีวิว
                        imagePreview.src = e.target.result;
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        // Logic การ Submit ฟอร์ม (เหมือนเดิม)
        updateProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const successDiv = document.getElementById('update-success');

            const formData = new FormData();
            formData.append('firstName', document.getElementById('firstName').value);
            formData.append('lastName', document.getElementById('lastName').value);

            const imageFile = newProfileImageInput.files[0];
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            try {
                const res = await fetch('/api/v1/users/update-me', {
                    method: 'PATCH',
                    body: formData
                });
                const data = await res.json();
                if (data.status === 'success') {
                    successDiv.classList.remove('d-none');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                alert('An error occurred. Please try again.');
            }
        });
    }


    // --- BLOCK 2: HOMEPAGE (Hero Section) ---
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const targetDateStr = heroSection.dataset.eventDate;
        const targetTimeStr = heroSection.dataset.eventTime;
        if (targetDateStr && targetTimeStr) {
            const datePart = targetDateStr.split('T')[0];
            const targetDateTimeString = `${datePart}T${targetTimeStr}:00`;
            const targetDate = new Date(targetDateTimeString).getTime();
            const heroCountdownInterval = setInterval(() => {
                const now = new Date().getTime();
                const distance = targetDate - now;
                if (distance < 0) {
                    clearInterval(heroCountdownInterval);
                    document.getElementById('hero-countdown').innerHTML = '<h4>Event has started!</h4>';
                    return;
                }
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
                document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');
            }, 1000);
        }
    }

    const heroBookBtn = document.getElementById('hero-book-btn');
    if (heroBookBtn) {
        heroBookBtn.addEventListener('click', async (e) => {
            const eventId = e.target.dataset.eventId;
            if (!eventId) return;

            // 1. ตรวจสอบ Role ของผู้ใช้ที่ล็อกอินอยู่
            const userRole = document.body.getAttribute('data-user-role');

            // 2. จัดการตาม Role
            if (userRole === 'attendee') {
                // --- กรณีเป็น Attendee (Flow ปกติ) ---
                try {
                    heroBookBtn.disabled = true;
                    heroBookBtn.textContent = 'Processing...';

                    // ดึงข้อมูล Event เพื่อตรวจสอบราคา
                    const res = await fetch(`/api/v1/events/${eventId}`);
                    const data = await res.json();

                    if (data.status === 'success') {
                        const eventData = data.data.event;

                        // ตัดสินใจตามราคา
                        if (eventData.price === 0) {
                            if (confirm('This is a free event. Do you want to book it now?')) {
                                await bookEvent(eventId); // เรียกใช้ฟังก์ชันจอง
                            }
                        } else {
                            // ถ้าเสียเงิน, ไปหน้าชำระเงิน
                            window.location.assign(`/checkout/${eventId}`);
                        }
                    } else {
                        alert('Error: Could not retrieve event details.');
                    }
                } catch (err) {
                    alert('An error occurred. Please try again.');
                } finally {
                    heroBookBtn.disabled = false;
                    heroBookBtn.textContent = 'Book Now';
                }

            } else if (userRole === 'guest') {
                // --- กรณีเป็น Guest ---
                alert('Please log in to book this event.');
                window.location.assign('/login');

            } else {
                // --- กรณีเป็น Organizer หรือ Admin ---
                alert('Only attendees can book events. You are currently logged in as an ' + userRole + '.');
            }
        });
    }

    // --- BLOCK 3: EVENT DETAIL MODAL LOGIC (for Upcoming Events) ---
    const eventDetailModal = document.getElementById('eventDetailModal');
    if (eventDetailModal) {
        // ประกาศตัวแปรทั้งหมดที่ใช้ใน Modal
        const modalElements = {
            name: document.getElementById('modalEventName'),
            image: document.getElementById('modalEventImage'),
            date: document.getElementById('modalEventDate'),
            time: document.getElementById('modalEventTime'),
            location: document.getElementById('modalEventLocation'),
            priceDisplay: document.getElementById('modal-price-display'),
            freeDisplay: document.getElementById('modal-free-display'),
            price: document.getElementById('modalEventPrice'),
            tickets: document.getElementById('modalEventTickets'),
            description: document.getElementById('modalEventDescription'),
            organizer: document.getElementById('modalEventOrganizer'),
            bookButton: document.getElementById('modalBookButton'),
            countdown: document.getElementById('modalEventCountdown')
        };

        // Listener for when the modal is about to be shown
        eventDetailModal.addEventListener('show.bs.modal', async (event) => {
            if (countdownInterval) clearInterval(countdownInterval);

            const button = event.relatedTarget;
            if (!button) return;

            const eventId = button.getAttribute('data-event-id');
            modalElements.name.textContent = 'Loading...';

            try {
                const res = await fetch(`/api/v1/events/${eventId}`);
                const data = await res.json();

                if (data.status === 'success') {
                    const eventData = data.data.event;
                    modalElements.name.textContent = eventData.name;
                    modalElements.image.src = eventData.imageUrl;
                    modalElements.date.textContent = new Date(eventData.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
                    modalElements.time.textContent = eventData.time;
                    modalElements.location.textContent = eventData.location;
                    modalElements.tickets.textContent = eventData.ticketAvailable;
                    modalElements.description.textContent = eventData.description;
                    modalElements.organizer.textContent = `${eventData.organizer.firstName} ${eventData.organizer.lastName}`;

                    // Logic แสดง ราคา/ฟรี
                    if (eventData.price > 0) {
                        modalElements.price.textContent = eventData.price.toLocaleString('en-US');
                        modalElements.priceDisplay.classList.remove('d-none');
                        modalElements.freeDisplay.classList.add('d-none');
                    } else {
                        modalElements.priceDisplay.classList.add('d-none');
                        modalElements.freeDisplay.classList.remove('d-none');
                    }

                    const datePart = eventData.date.split('T')[0];
                    const targetDateTimeString = `${datePart}T${eventData.time}:00`;
                    const targetDate = new Date(targetDateTimeString).getTime();

                    const updateCountdown = () => {
                        const now = new Date().getTime();
                        const distance = targetDate - now;
                        if (distance < 0) {
                            modalElements.countdown.innerHTML = "Event has already started!";
                            clearInterval(countdownInterval); return;
                        }
                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        modalElements.countdown.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                    };
                    updateCountdown(); 
                    countdownInterval = setInterval(updateCountdown, 1000); 

                    // ★★★ Logic แสดง/ซ่อน และตั้งค่าปุ่ม Booking ★★★
                    const userRole = document.body.getAttribute('data-user-role');
                    if (userRole === 'attendee' && eventData.ticketAvailable > 0) {
                        modalElements.bookButton.classList.remove('d-none');
                        modalElements.bookButton.dataset.eventId = eventId;
                        modalElements.bookButton.textContent = eventData.price > 0 ? 'Proceed to Checkout' : 'Book For Free';
                    } else {
                        modalElements.bookButton.classList.add('d-none');
                    }
                } else {
                    modalElements.name.textContent = 'Error: ' + data.message;
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                modalElements.name.textContent = 'Error loading event details.';
            }
        });

        // Listener for when the modal is about to be hidden
        eventDetailModal.addEventListener('hide.bs.modal', () => {
            if (countdownInterval) clearInterval(countdownInterval);
            if (modalElements.countdown) modalElements.countdown.innerHTML = "";
        });

        // Listener for the modal's booking button
        if (modalElements.bookButton) {
            modalElements.bookButton.addEventListener('click', async (e) => {
                const eventId = e.target.dataset.eventId;
                if (!eventId) return;
                try {
                    // ดึงข้อมูล Event อีกครั้งเพื่อเช็คราคา (เพื่อความปลอดภัย)
                    const res = await fetch(`/api/v1/events/${eventId}`);
                    const data = await res.json();
                    const eventData = data.data.event;

                    if (eventData.price === 0) {
                        bookEvent(eventId); // เรียกใช้ Helper Function
                    } else {
                        window.location.assign(`/checkout/${eventId}`);
                    }
                } catch (err) {
                    alert('An error occurred. Please try again.');
                }
            });
        }
    }

    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', (e) => {
            const eventId = e.target.dataset.eventId;
            e.target.disabled = true;
            e.target.textContent = 'Processing...';
            // เรียกฟังก์ชันจองอีเวนต์
            bookEvent(eventId);
        });
    }


    // --- BLOCK 4: FORMS (Create/Edit Event) ---
    const createEventForm = document.getElementById('create-event-form');
    if (createEventForm) {
        // --- 1. Image Preview Logic ---
        const imagePreviewContainer = document.getElementById('image-preview-container');
        const imagePreviewImg = document.getElementById('image-preview');
        const imagePreviewText = document.querySelector('.image-preview-text');
        const imageUrlInput = document.getElementById('imageUrl');

        if (imagePreviewContainer && imageUrlInput) {
            // เมื่อกล่องพรีวิวถูกคลิก -> ให้ไปคลิก input file ที่ซ่อนอยู่
            imagePreviewContainer.addEventListener('click', () => {
                imageUrlInput.click();
            });

            // เมื่อเลือกไฟล์แล้ว
            imageUrlInput.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // แสดงรูปและซ่อนข้อความ placeholder
                        imagePreviewImg.src = e.target.result;
                        imagePreviewImg.classList.remove('d-none');
                        if (imagePreviewText) imagePreviewText.classList.add('d-none');
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        // --- 2. Upgraded Submit Logic ---
        createEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('create-event-error');
            const submitBtn = document.getElementById('create-event-btn');
            const spinner = submitBtn.querySelector('.spinner-border');

            // --- แสดงสถานะ Loading ---
            submitBtn.disabled = true;
            spinner.classList.remove('d-none');
            errorDiv.classList.add('d-none');

            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('date', document.getElementById('date').value);
            formData.append('time', document.getElementById('time').value);
            formData.append('location', document.getElementById('location').value);
            formData.append('ticketAvailable', document.getElementById('ticketAvailable').value);
            formData.append('price', document.getElementById('price').value);
            if (imageUrlInput.files[0]) {
                formData.append('imageUrl', imageUrlInput.files[0]);
            }

            try {
                const res = await fetch('/api/v1/events', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.status === 'success') {
                    alert('Event created successfully!');
                    window.location.assign('/dashboard');
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                errorDiv.textContent = err.message || 'Something went wrong.';
                errorDiv.classList.remove('d-none');
            } finally {
                // --- คืนค่าปุ่มให้เป็นปกติ ---
                submitBtn.disabled = false;
                spinner.classList.add('d-none');
            }
        });
    }

    const editEventForm = document.getElementById('edit-event-form');
    if (editEventForm) {

        // --- 1. Image Preview Logic ---
        const newImageInput = document.getElementById('newImageUrl');
        const imagePreview = document.getElementById('image-preview');
        if (newImageInput && imagePreview) {
            newImageInput.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.src = e.target.result;
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        // --- 2. Upgraded Submit Logic ---
        editEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('edit-event-error');
            const saveBtn = document.getElementById('save-changes-btn');
            const spinner = saveBtn.querySelector('.spinner-border');

            saveBtn.disabled = true;
            spinner.classList.remove('d-none');
            errorDiv.classList.add('d-none');

            const eventId = e.target.dataset.eventId;
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('date', document.getElementById('date').value);
            formData.append('time', document.getElementById('time').value);
            formData.append('location', document.getElementById('location').value);
            formData.append('ticketAvailable', document.getElementById('ticketAvailable').value);
            formData.append('price', document.getElementById('price').value);

            // ★★★ เพิ่มรูปภาพใหม่ลงใน FormData ถ้ามีการเลือกไฟล์ ★★★
            const imageFile = newImageInput.files[0];
            if (imageFile) {
                // ใช้ชื่อ key 'imageUrl' ให้ตรงกับที่ Controller คาดหวัง
                formData.append('imageUrl', imageFile);
            }

            try {
                const res = await fetch(`/api/v1/events/${eventId}`, { method: 'PATCH', body: formData });
                const data = await res.json();
                if (data.status === 'success') {
                    alert('Event updated successfully!');
                    window.location.assign('/dashboard');
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                errorDiv.textContent = err.message || 'An error occurred. Please try again.';
                errorDiv.classList.remove('d-none');
            } finally {
                saveBtn.disabled = false;
                spinner.classList.add('d-none');
            }
        });
    }


    // --- BLOCK 5: PAGE-SPECIFIC LOGIC ---
    // Dashboard Delete Button
    const dashboard = document.querySelector('body');
    if (dashboard) {
        dashboard.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-event-btn')) {
                e.preventDefault();
                const eventId = e.target.dataset.eventId;
                if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                    try {
                        const res = await fetch(`/api/v1/events/${eventId}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert('Event deleted successfully!');
                            location.reload();
                        } else {
                            const data = await res.json();
                            alert(`Error: ${data.message}`);
                        }
                    } catch (err) {
                        alert('An error occurred. Please try again.');
                    }
                }
            }
        });
    }

    // QR Code Generation (My Bookings page)
    const qrcodeContainers = document.querySelectorAll('[id^="qrcode-"]');
    if (qrcodeContainers.length > 0) {
        qrcodeContainers.forEach(container => {
            const bookingId = container.id.split('-')[1];
            if (bookingId) {
                new QRCode(container, {
                    text: bookingId,
                    width: 128,
                    height: 128,
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        });
    }

    // QR Code Scanner (Scanner page)
    const qrReaderDiv = document.getElementById('qr-reader');
    if (qrReaderDiv) {
        const resultsDiv = document.getElementById('qr-reader-results');
        const onScanSuccess = async (decodedText, decodedResult) => {
            resultsDiv.innerHTML = `<div class="alert alert-info">Verifying ticket...</div>`;
            try {
                const res = await fetch('/api/v1/bookings/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: decodedText })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    resultsDiv.innerHTML = `<div class="alert alert-success"><strong>Success!</strong> Ticket is valid. Check-in complete.</div>`;
                } else {
                    resultsDiv.innerHTML = `<div class="alert alert-danger"><strong>Failed!</strong> ${data.message}</div>`;
                }
            } catch (err) {
                resultsDiv.innerHTML = `<div class="alert alert-danger"><strong>Error!</strong> Could not connect to the server.</div>`;
            }
        }
        const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } });
        html5QrcodeScanner.render(onScanSuccess);
    }

    // --- BLOCK 6: ADMIN PANEL LOGIC ---
    const adminPanel = document.querySelector('body'); // หรือหา element ที่ครอบคลุมกว่า
    if (adminPanel && document.getElementById('user-search')) { // เช็คว่านี่คือหน้า admin panel จริงๆ

        // --- Search Logic ---
        const userSearch = document.getElementById('user-search');
        const userTableBody = document.getElementById('user-table-body');
        userSearch.addEventListener('keyup', () => {
            const searchTerm = userSearch.value.toLowerCase();
            Array.from(userTableBody.getElementsByTagName('tr')).forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });

        const eventSearch = document.getElementById('event-search');
        const eventTableBody = document.getElementById('event-table-body');
        eventSearch.addEventListener('keyup', () => {
            const searchTerm = eventSearch.value.toLowerCase();
            Array.from(eventTableBody.getElementsByTagName('tr')).forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });

        // --- Actions Logic (Event Delegation) ---
        adminPanel.addEventListener('change', (e) => {
            // Show "Save" button when role is changed
            if (e.target.classList.contains('user-role-select')) {
                const userId = e.target.dataset.userId;
                const saveBtn = document.querySelector(`.save-role-btn[data-user-id="${userId}"]`);
                if (saveBtn) saveBtn.classList.remove('d-none');
            }
        });

        adminPanel.addEventListener('click', async (e) => {
            // --- Save Role Button ---
            if (e.target.classList.contains('save-role-btn')) {
                const userId = e.target.dataset.userId;
                const selectEl = document.querySelector(`.user-role-select[data-user-id="${userId}"]`);
                const newRole = selectEl.value;

                e.target.disabled = true;
                e.target.textContent = 'Saving...';

                try {
                    const res = await fetch(`/api/v1/users/role/${userId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: newRole })
                    });
                    const data = await res.json();
                    if (data.status === 'success') {
                        e.target.classList.add('d-none');
                        e.target.textContent = 'Save';
                    } else { throw new Error(data.message); }
                } catch (err) {
                    alert('Error: ' + err.message);
                    e.target.textContent = 'Save';
                } finally {
                    e.target.disabled = false;
                }
            }

            // --- Admin Delete User Button ---
            if (e.target.classList.contains('admin-delete-user-btn')) {
                const userId = e.target.dataset.userId;
                if (confirm(`Are you sure you want to delete this user? This cannot be undone.`)) {
                    try {
                        const res = await fetch(`/api/v1/users/${userId}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert('User deleted successfully.');
                            location.reload();
                        } else { const data = await res.json(); throw new Error(data.message); }
                    } catch (err) { alert('Error: ' + err.message); }
                }
            }

            // --- Admin Delete Event Button ---
            if (e.target.classList.contains('admin-delete-event-btn')) {
                const eventId = e.target.dataset.eventId;
                if (confirm(`Are you sure you want to delete this event? This cannot be undone.`)) {
                    try {
                        const res = await fetch(`/api/v1/events/${eventId}`, { method: 'DELETE' });
                        if (res.ok) {
                            alert('Event deleted successfully.');
                            location.reload();
                        } else { const data = await res.json(); throw new Error(data.message); }
                    } catch (err) { alert('Error: ' + err.message); }
                }
            }
        });
    }
    const searchInput = document.getElementById('navbar-search-input');
    const searchResultsList = document.getElementById('search-results-list');

    if (searchInput && searchResultsList) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value;

            if (query.length < 2) {
                searchResultsList.classList.add('d-none');
                searchResultsList.innerHTML = '';
                return;
            }

            try {
                const res = await fetch(`/api/v1/events/search-autocomplete?q=${query}`);
                // API ตอบกลับมาเป็น array ของ events โดยตรง
                const events = await res.json();

                searchResultsList.innerHTML = '';

                if (events.length > 0) {
                    events.forEach(event => {
                        const item = document.createElement('button');
                        item.type = 'button';
                        item.classList.add('list-group-item', 'list-group-item-action');
                        item.textContent = event.name;
                        item.dataset.bsToggle = 'modal';
                        item.dataset.bsTarget = '#eventDetailModal';
                        item.dataset.eventId = event._id;
                        searchResultsList.appendChild(item);
                    });
                    searchResultsList.classList.remove('d-none');
                } else {
                    searchResultsList.classList.add('d-none');
                }
            } catch (err) {
                console.error('Search autocomplete error:', err);
                searchResultsList.classList.add('d-none');
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) {
                searchResultsList.classList.add('d-none');
            }
        });
    }

});
