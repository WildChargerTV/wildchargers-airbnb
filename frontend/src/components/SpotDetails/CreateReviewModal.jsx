/** src/components/SpotDetails/SingleReview.jsx - Modal Component
 ** Renders a form that accepts input to create a new Review for a Spot.
 ** Note: Uses Modal.css for formatting. Any unique rules would be in SpotDetails.css
 *  TODO: The Star Rating form element is incomplete.
*/

import { useEffect, useState } from 'react';
import { MdOutlineStarBorder } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { createReview } from '../../store/reviews';

/** Helper Component StarRatingInput 
 ** Displays a five-star scale on which the star rating can be set.
 *  Component Props:
 *  @param stateVar (any) - The state variable that this input is assigned to.
 *  @param onChange (function) - Passthru onChange callback function.
*/
function StarRatingInput({ stateVar, onChange }) {
    return (<>
        <input type='number' value={stateVar} onChange={onChange} />
        <div className='rating-input'>
            <div className='filled-star'><MdOutlineStarBorder /></div>
            <div className='filled-star'><MdOutlineStarBorder /></div>
            <div className='filled-star'><MdOutlineStarBorder /></div>
            <div className='filled-star'><MdOutlineStarBorder /></div>
            <div className='filled-star'><MdOutlineStarBorder /></div>
            <small> Stars</small>
        </div>
    </>)
}

/** Component Props:
 *  @param spotId (number) - The id of the Spot to add this Review to.
*/
export default function CreateReviewModal({ spotId }) {
    const dispatch = useDispatch();
    const [review, setReview] = useState('');
    const [stars, setStars] = useState(0);
    const [disabled, setDisabled] = useState(true);
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    // Execute the Review's creation, then close the Modal. 
    // In the event of errors, the modal close will not occur.
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(createReview({ review, stars }, spotId))
        .then(closeModal)
        .catch(async (res) => {
            const data = await res.json();
            if(data?.errors) setErrors(data.errors);
            if(data?.message) setErrors(data);
        });
    }

    /** Determine whether or not to disable the submission button. Checks include:
     *  1: Both fields must be populated.
     *  2: The Review must be at least 10 characters long.
     *  3: The Stars must be between 1 and 5 inclusive.
    */
    useEffect(() => setDisabled(
        review?.length < 10 ||
        stars < 1 ||
        stars > 5
    ), [review, stars]);

    return (<>
        {/* Modal Title */}
        <h2 className='modal-title'>How was your stay?</h2>

        {/* Modal Form - to submit a new Review */}
        <form className='modal-form' onSubmit={handleSubmit}>
            {/* Error Handling */}
            {errors.review && <p className='modal-form__error'>{errors.review}</p>}
            {errors.rating && <p className='modal-form__error'>{errors.rating}</p>}
            {errors.message && <p className='modal-form__error'>{errors.message}</p>}

            {/* Review Multi-Line Text Input */}
            <textarea 
                placeholder='Leave your review here...' 
                value={review} 
                onChange={(e) => setReview(e.target.value)}
            />
            
            {/* Star Rating Input - see above helper component */}
            <StarRatingInput 
                stateVar={stars} 
                onChange={(e) => setStars(Number(e.target.value))} 
            />

            {/* Submit Button */}
            <button 
                type='submit' 
                className='modal-form__button' 
                disabled={disabled}
            >Submit Your Review</button>
        </form>
    </>)
}