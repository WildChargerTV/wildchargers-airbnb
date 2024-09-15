import { csrfFetch } from "./csrf";

const LOAD = 'review/LOAD';
const ADD = 'review/ADD';
const ADD_IMAGE = 'review/ADD_IMG';
const EDIT = 'review/EDIT';
const DELETE = 'review/DELETE';
const DELETE_IMAGE = 'review/DELETE_IMG';

const load = (list) => ({ type: LOAD, list });
const add = (review) => ({ type: ADD, review });
const addImage = (image, reviewId) => ({ type: ADD_IMAGE, image, reviewId });
const edit = (review) => ({ type: EDIT, review });
const remove = (reviewId) => ({ type: DELETE, reviewId });
const removeImage = (imageId) => ({ type: DELETE_IMAGE, imageId });

export const getReviewsBySpot = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
    if(response.ok) {
        const reviews = await response.json();
        dispatch(load(reviews));
    }
}
export const getCurrentReviews = () => async (dispatch) => {
    const response = await csrfFetch('/api/reviews/current');
    if(response.ok) {
        const reviews = await response.json();
        dispatch(load(reviews));
    }
}

export const createReview = (payload, spotId) => async (dispatch) => {
    console.log(payload, spotId)
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const newReview = await response.json();
        dispatch(add(newReview));
    }
}
export const addImageToReview = (payload, reviewId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const newImage = await response.json();
        dispatch(addImage(newImage));
    }
}

export const editReview = (payload, reviewId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const review = await response.json();
        dispatch(edit(review)); // NOTE: return Review carries id, reviewId passthru not needed
    }
}

export const deleteReview = (reviewId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
    if(response.ok) dispatch(remove(reviewId));
}
export const deleteReviewImage = (imageId) => async (dispatch) => {
    const response = await csrfFetch(`/api/review-images/${imageId}`, { method: 'DELETE' });
    if(response.ok) dispatch(removeImage(imageId));
}

const initialState = {};

const reviewReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOAD:
            return {...state, ...action.list};
        case ADD: {
            const newState = structuredClone(state);
            state.Reviews.unshift(action.review);
            return newState;
        }
        case ADD_IMAGE:
        case EDIT:
            return {...state, ...action};
        case DELETE: {
            const newState = structuredClone(state);
            newState.Reviews = newState.Reviews?.filter((review) => review.id !== action.reviewId);
            return newState;
        }
        case DELETE_IMAGE:
            return {...state, ...action};
        default:
            return state;
    }
}

export default reviewReducer;