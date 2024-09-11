const LOAD = 'booking/LOAD';
const ADD = 'booking/ADD';
const EDIT = 'booking/EDIT';
const DELETE = 'booking/DELETE';

const load = (list) => ({ type: LOAD, list });
const add = (booking) => ({ type: ADD, booking });
const edit = (booking) => ({ type: EDIT, booking });
const remove = (bookingId) => ({ type: DELETE, bookingId });

export const getBookingsBySpot = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}/bookings`);
    if(response.ok) {
        const bookings = await response.json();
        dispatch(load(bookings));
    }
}
export const getCurrentBookings = () => async (dispatch) => {
    const response = await fetch('/api/bookings/current');
    if(response.ok) {
        const bookings = await response.json();
        dispatch(load(bookings));
    }
}

export const createBooking = (payload, spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const newBooking = await response.json();
        dispatch(add(newBooking));
    }
}

export const editBooking = (payload, bookingId) => async (dispatch) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const booking = await response.json();
        dispatch(edit(booking)); // NOTE: return Booking carries id, bookingId passthru not needed
    }
}

export const deleteBooking = (bookingId) => async (dispatch) => {
    const response = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
    if(response.ok) dispatch(remove(bookingId));
}

const initialState = {};

const bookingReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOAD:
        case ADD:
        case EDIT:
        case DELETE:
            console.warn(action);
            break;
        default:
            return state;
    }
}

export default bookingReducer;