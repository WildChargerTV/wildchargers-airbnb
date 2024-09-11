const LOAD = 'spot/LOAD_ALL';
const LOAD_ONE = 'spot/LOAD_ONE';
const ADD = 'spot/ADD';
const ADD_IMAGE = 'spot/ADD_IMG';
const EDIT = 'spot/EDIT';
const DELETE = 'spot/DELETE';
const DELETE_IMAGE = 'spot/DELETE_IMG';

const loadAll = (list) => ({ type: LOAD, list });
const loadOne = (spot) => ({ type: LOAD_ONE, spot }); 
const add = (spot) => ({ type: ADD, spot });
const addImage = (image, spotId) => ({ type: ADD_IMAGE, image, spotId });
const edit = (spot) => ({ type: EDIT, spot });
const remove = (spotId) => ({ type: DELETE, spotId });
const removeImage = (imageId) => ({ type: DELETE_IMAGE, imageId });

export const getSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots');
    if(response.ok) {
        const spots = await response.json();
        dispatch(loadAll(spots));
    }
}
export const getSpotById = (id) => async (dispatch) => {
    const response = await fetch(`/api/spots/${id}`);
    if(response.ok) {
        const spot = await response.json();
        dispatch(loadOne(spot));
    }
}
export const getCurrentSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots/current');
    if(response.ok) {
        const spots = await response.json();
        dispatch(loadAll(spots));
    }
}

export const createSpot = (payload) => async (dispatch) => {
    const response = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const newSpot = await response.json();
        dispatch(add(newSpot));
    } // TODO create error handling
}
export const addImageToSpot = (payload, spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const newImage = await response.json();
        dispatch(addImage(newImage, spotId))
    } // TODO create error handling
}

export const editSpot = (payload, spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if(response.ok) {
        const spot = await response.json();
        dispatch(edit(spot)); // NOTE: return Spot carries id, spotId passthru not needed
    } // TODO create error handling
}

export const deleteSpot = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}`, { method: 'DELETE' });
    if(response.ok) dispatch(remove(spotId));
}
export const deleteSpotImage = (imageId) => async (dispatch) => {
    const response = await fetch(`api/spot-images/${imageId}`);
    if(response.ok) dispatch(removeImage(imageId));
}

const initialState = {}

const spotReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOAD:
        case LOAD_ONE:
        case ADD:
        case ADD_IMAGE:
        case EDIT:
        case DELETE:
        case DELETE_IMAGE:
            console.log(action);
            return {...state, ...action.list};
        default:
            return state;
    }
}

export default spotReducer;