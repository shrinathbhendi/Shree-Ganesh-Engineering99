document.addEventListener('DOMContentLoaded', () => {
    // CONTACT FORM VALIDATION & SUBMIT TRIGGER
    const contactForm = document.getElementById('company-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // Simple presence checks
            if (!name || !email || !phone || !message) {
                alert('Please fill out all required fields.');
                return;
            }

            // Success feedback message
            alert(`Thank you, ${name}! Your inquiry has been logged successfully. Maruti Shastri or one of our sales representatives will contact you shortly.`);
            contactForm.reset();
        });
    }
});
