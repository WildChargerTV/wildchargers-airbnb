import { useState } from 'react';
import { MdOutlineStarBorder } from 'react-icons/md';
//import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';

export function OpenCreateReviewModal({ modalComponent, buttonText, onButtonClick, onModalClose }) {
    const { setModalContent, setOnModalClose } = useModal();

    const onClick = () => {
        if (onModalClose) setOnModalClose(onModalClose);
        setModalContent(modalComponent);
        if (typeof onButtonClick === 'function') onButtonClick();
    }

    return <button onClick={onClick}>{buttonText}</button>
}

function StarRatingInput({ rating, onChange }) {
    return (<>
        <input type='number' value={rating} onChange={onChange} />
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

function CreateReviewModal() {
    //const dispatch = useDispatch();
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [errors, setErrors] = useState({});
    //const { closeModal } = useModal();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
    }

    return (<>
        <h2 className='modal-title'>How was your stay?</h2>
        <form className='modal-form' onSubmit={handleSubmit}>
            {errors.review && <p className='modal-form__error'>{errors.review}</p>}
            {errors.rating && <p className='modal-form__error'>{errors.rating}</p>}
            <textarea placeholder='Leave your review here...' value={review} onChange={(e) => setReview(e.target.value)} />
            <StarRatingInput rating={rating} onChange={(e) => setRating(e.target.value)} />
            <button type='submit'>Submit Your Review</button>
        </form>
    </>)
}

export default CreateReviewModal;