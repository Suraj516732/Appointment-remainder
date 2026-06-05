/**
 * Appointment Reminder System - Frontend Logic
 * Implements createAppointment, loadAppointments, showSuccess, and showError.
 */

const API_BASE_URL = "http://127.0.0.1:8000";

// Initialize page on DOM content load
document.addEventListener("DOMContentLoaded", () => {
    const appointmentForm = document.getElementById("appointmentForm");
    const tableBody = document.getElementById("tableBody");

    if (appointmentForm) {
        // We are on index.html (Appointment Creation Page)
        appointmentForm.addEventListener("submit", createAppointment);
        
        // Set default minimum date-time to current time
        const timeInput = document.getElementById("time");
        if (timeInput) {
            const now = new Date();
            // Format now as YYYY-MM-DDTHH:MM
            const isoString = now.toISOString().slice(0, 16);
            timeInput.min = isoString;
        }
    }

    if (tableBody) {
        // We are on dashboard.html (Dashboard Page)
        loadAppointments();
    }
});

/**
 * Creates an appointment by submitting data to the FastAPI backend.
 * @param {Event} event - Form submission event
 */
async function createAppointment(event) {
    event.preventDefault();
    clearInlineAlert();

    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const timeInput = document.getElementById("time");
    const submitBtn = document.getElementById("submitBtn");

    if (!nameInput || !phoneInput || !timeInput) return;

    const customer_name = nameInput.value.trim();
    const phone_number = phoneInput.value.trim();
    const appointment_time = timeInput.value;

    // Frontend validation
    if (!customer_name) {
        showError("Customer name is required.");
        return;
    }
    if (!phone_number) {
        showError("Phone number is required.");
        return;
    }
    if (!appointment_time) {
        showError("Appointment date & time is required.");
        return;
    }

    const payload = {
        customer_name,
        phone_number,
        appointment_time
    };

    // Show loading state
    if (submitBtn) {
        submitBtn.classList.add("btn-loading");
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/appointment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || `Server error (${response.status})`);
        }

        const result = await response.json();
        
        // Success
        showSuccess(result.message || "Appointment Created successfully!");
        
        // Clear form
        document.getElementById("appointmentForm").reset();
    } catch (error) {
        console.error("Error creating appointment:", error);
        showError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
        // Remove loading state
        if (submitBtn) {
            submitBtn.classList.remove("btn-loading");
            submitBtn.disabled = false;
        }
    }
}

/**
 * Fetches appointments from the FastAPI backend and populates the dashboard table & stats cards.
 */
async function loadAppointments() {
    const tableBody = document.getElementById("tableBody");
    const emptyState = document.getElementById("emptyState");
    const statTotal = document.getElementById("statTotal");
    const statNext = document.getElementById("statNext");

    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch appointments (${response.status})`);
        }

        const appointments = await response.json();

        // Clear loading skeleton
        tableBody.innerHTML = "";

        // Set total stat count
        if (statTotal) {
            statTotal.textContent = appointments.length;
        }

        if (appointments.length === 0) {
            // Show empty state, hide table card body rows (or keep the header empty)
            if (emptyState) emptyState.style.display = "flex";
            if (statNext) statNext.textContent = "None scheduled";
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        // Find upcoming soonest appointment
        const now = new Date();
        let nextAppointment = null;
        let soonestDiff = Infinity;

        // Render rows
        appointments.forEach(item => {
            const apptDate = new Date(item.appointment_time);
            
            // Check if this is the upcoming soonest
            if (apptDate > now) {
                const diff = apptDate - now;
                if (diff < soonestDiff) {
                    soonestDiff = diff;
                    nextAppointment = item;
                }
            }

            const row = document.createElement("tr");
            
            // Format time beautifully
            const formattedTime = formatDateTime(item.appointment_time);

            row.innerHTML = `
                <td><span class="badge badge-id">#${item.id}</span></td>
                <td style="font-weight: 600;">${escapeHtml(item.customer_name)}</td>
                <td><span class="badge">${escapeHtml(item.phone_number)}</span></td>
                <td>${formattedTime}</td>
            `;
            
            tableBody.appendChild(row);
        });

        // Set upcoming soonest stat text
        if (statNext) {
            if (nextAppointment) {
                const apptDate = new Date(nextAppointment.appointment_time);
                statNext.textContent = apptDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + 
                    " @ " + apptDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            } else {
                statNext.textContent = "None upcoming";
            }
        }

    } catch (error) {
        console.error("Error loading appointments:", error);
        showError("Could not retrieve appointments. Please ensure the backend is running.");
        
        // Show error state inside table if load fails completely
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--error); padding: 3rem;">
                    <strong>Error:</strong> ${error.message || "Failed to load appointments."}
                    <br>
                    <button class="btn btn-outline btn-sm" onclick="loadAppointments()" style="margin-top: 1rem;">
                        Retry Load
                    </button>
                </td>
            </tr>
        `;
    }
}

/**
 * Formats an ISO datetime string into a human-readable format.
 * @param {string} isoString - Date ISO string
 * @returns {string} Formatted string
 */
function formatDateTime(isoString) {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + " at " + date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return isoString;
    }
}

/**
 * Escapes HTML to prevent potential XSS injection of customer names.
 * @param {string} string - Unsafe string
 * @returns {string} Safe string
 */
function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

/**
 * Displays a success toast and/or inline alert.
 * @param {string} message - Message text
 */
function showSuccess(message) {
    showInlineAlert(message, 'success');
    showToast(message, 'success');
}

/**
 * Displays an error toast and/or inline alert.
 * @param {string} message - Message text
 */
function showError(message) {
    showInlineAlert(message, 'error');
    showToast(message, 'error');
}

/**
 * Helper to show inline alerts on the form card.
 */
function showInlineAlert(message, type) {
    const alertBanner = document.getElementById("alertBanner");
    const alertMessage = document.getElementById("alertMessage");
    if (!alertBanner || !alertMessage) return;

    alertMessage.textContent = message;
    alertBanner.className = `alert alert-${type} alert-show`;

    const svgPath = alertBanner.querySelector("path");
    if (svgPath) {
        if (type === 'success') {
            svgPath.setAttribute("d", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z");
        } else {
            svgPath.setAttribute("d", "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z");
        }
    }
}

/**
 * Clears inline alerts from the form.
 */
function clearInlineAlert() {
    const alertBanner = document.getElementById("alertBanner");
    if (!alertBanner) return;
    alertBanner.className = "alert";
}

/**
 * Renders a floating toast notification.
 */
function showToast(message, type = 'success') {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg style="width:1.25rem;height:1.25rem;color:var(--success);flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else {
        iconSvg = `<svg style="width:1.25rem;height:1.25rem;color:var(--error);flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    }

    toast.innerHTML = `
        ${iconSvg}
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.classList.add("toast-show");
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove("toast-show");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4500);
}