//localStorage.clear();

// reload the page with local storage information
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
let currentPatient = JSON.parse(localStorage.getItem('currentPatient')) || null;

//
const currentPatientDiv = document.querySelector('#currentPatient');
const waitingPatientsDiv = document.querySelector('#waitingPatients');
const comingPatientsDiv = document.querySelector('#comingPatients');
const bookingForm = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const alertContainer = document.getElementById('alertContainer');

// refresh all parts
function renderCurrentPatient() {
    currentPatientDiv.innerHTML = '';
    if (currentPatient) {
        const card = createBookingCard(currentPatient, false, true);
        currentPatientDiv.appendChild(card);
    } else {
        currentPatientDiv.innerHTML = '<p class="card-text">لا يوجد مريض قيد المعالجة.</p>';
    }
}

function renderWaitingPatients() {
    waitingPatientsDiv.innerHTML = '';
    const waiting = bookings.filter((b) => b.status === 'waiting');
    if (waiting.length > 0) {
        waiting.forEach((b) => {
            const card = createBookingCard(b, true, false);
            waitingPatientsDiv.appendChild(card);
        });
    } else {
        waitingPatientsDiv.innerHTML = '<p class="card-text">لا يوجد مرضى في الانتظار.</p>';
    }
}

function renderComingPatients() {
    comingPatientsDiv.innerHTML = '';
    const coming = bookings.filter((b) => b.status === 'coming');
    if (coming.length > 0) {
        coming.forEach((b) => {
            const card = createBookingCard(b, true, false);
            comingPatientsDiv.appendChild(card);
        });
    } else {
        comingPatientsDiv.innerHTML = '<p class="card-text">لا يوجد مرضى قادمين.</p>';
    }
}

// create the booking card with Bootstrap && animate
function createBookingCard(booking, showActions = false, isCurrent = false) {
    const card = document.createElement('div');
    card.className = `card mb-3 animate__animated animate__fadeIn booking-card ${booking.bookingType}`;
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
        <h5 class="card-title text-center text-bg-secondary">${booking.patientName}</h5>
        <p class="card-text text-center"><strong>رقم الهاتف:</strong> ${booking.phoneNumber}</p>
        <p class="card-text text-center"><strong>زمرة الدم:</strong> ${booking.bloodType}</p>
        <p class="card-text text-center"><strong>نوع الحجز:</strong> ${booking.bookingType}</p>
        <p class="card-text text-center"><strong>تاريخ الحجز:</strong> ${new Date(
            booking.bookingDate
        ).toLocaleString()}</p>
      `;
    card.appendChild(cardBody);

    if (!isCurrent && showActions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'mt-2';
        if (booking.status === 'waiting') {
            const btnsDiv = document.createElement('div');
            btnsDiv.className = 'd-flex justify-content-center';
            const btnStart = document.createElement('button');
            btnStart.className = 'btn btn-primary btn-sm me-2';
            btnStart.innerText = 'بدء المعالجة';
            btnStart.onclick = () => {
                if (currentPatient === null) {
                    currentPatient = booking;
                    booking.status = 'current';
                    bookings = bookings.filter((b) => b.id !== booking.id);
                    updateLocalStorage();
                } else {
                    confirm('لا يزال يوجد مريض في حالة المعالجة');
                }
                renderAll();
            };
            btnsDiv.appendChild(btnStart);
            actionsDiv.appendChild(btnsDiv);
        }
        if (booking.status === 'coming') {
            const btnsDiv = document.createElement('div');
            btnsDiv.className = 'd-flex justify-content-evenly';
            // 1
            const btnMoveToWaiting = document.createElement('button');
            btnMoveToWaiting.className = 'btn btn-warning btn-sm me-2';
            btnMoveToWaiting.innerText = 'نقل إلى الانتظار';
            btnMoveToWaiting.onclick = () => {
                booking.status = 'waiting';
                updateLocalStorage();
                renderAll();
            };
            btnsDiv.appendChild(btnMoveToWaiting);

            // 2
            const btnCancel = document.createElement('button');
            btnCancel.className = 'btn btn-danger btn-sm';
            btnCancel.innerText = 'إلغاء الحجز';
            btnCancel.onclick = () => {
                bookings = bookings.filter((b) => b.id !== booking.id);
                updateLocalStorage();
                renderAll();
            };
            btnsDiv.appendChild(btnCancel);
            actionsDiv.appendChild(btnsDiv);
        }
        cardBody.appendChild(actionsDiv);
    }

    if (isCurrent) {
        const btnsDiv = document.createElement('div');
        btnsDiv.className = 'd-flex justify-content-center';
        const btnEndTreatment = document.createElement('button');
        btnEndTreatment.className = 'btn btn-danger btn-sm';
        btnEndTreatment.innerText = 'إنهاء المعالجة';
        btnEndTreatment.onclick = () => {
            currentPatient = null;
            updateLocalStorage();
            renderAll();
        };
        btnsDiv.appendChild(btnEndTreatment);
        cardBody.appendChild(btnsDiv);
    }

    return card;
}

// refresh all
function renderAll() {
    renderCurrentPatient();
    renderWaitingPatients();
    renderComingPatients();
}

// refresh in local Storage
function updateLocalStorage() {
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.setItem('currentPatient', JSON.stringify(currentPatient));
}

// when we add new booking
bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    const patientName = document.getElementById('patientName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const bloodType = document.getElementById('bloodType').value.trim();
    const bookingType = document.getElementById('bookingType').value;
    const bookingDate = document.getElementById('bookingDate').value.trim();

    const isDuplicate = bookings.some((booking) => booking.bookingDate === bookingDate);

    if (isDuplicate) {
        alert('التاريخ والوقت المحددان محجوزان بالفعل. يرجى اختيار وقت آخر.');
        return;
    }

    const newBooking = {
        id: Date.now(),
        patientName,
        phoneNumber,
        bloodType,
        bookingType,
        bookingDate,
        status: bookingType === 'مسبق' ? 'coming' : 'waiting',
    };

    bookings.push(newBooking);
    updateLocalStorage();
    renderAll();

    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerText = 'تم إضافة الحجز بنجاح!';
    alertContainer.appendChild(alert);

    setTimeout(() => alert.remove(), 3000);
    bookingForm.reset();
    submitBtn.disabled = false;
});

renderAll();
