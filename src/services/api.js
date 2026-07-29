/**
 * API service layer — all calls to the Django backend go through here.
 * Base URL is proxied through React dev server (see package.json "proxy").
 */

const BASE = '/api';

// ── helpers ──────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error(err.detail || 'Request failed'), { status: res.status, data: err });
    }
    return res.json();
}

// ── Properties ────────────────────────────────────────────────────────────────

/**
 * Fetch all properties.
 * @param {Object} params — optional filters: { block, marla, type, search }
 */
export function fetchProperties(params = {}) {
    const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'All'))
    ).toString();
    return request(`/properties/${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch a single property by id.
 * @param {number|string} id
 */
export function fetchProperty(id) {
    return request(`/properties/${id}/`);
}

/**
 * Fetch available filter options (marla sizes & blocks) from the API.
 */
export function fetchFilterOptions() {
    return request('/filters/');
}

// ── Enquiries ─────────────────────────────────────────────────────────────────

/**
 * Submit a contact enquiry.
 * @param {{ property: number, name: string, phone: string, email?: string, message?: string }} data
 */
export function submitEnquiry(data) {
    return request('/enquiries/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
