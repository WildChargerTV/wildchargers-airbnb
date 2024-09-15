/** src/components/SpotDetails/DeleteReviewModal.jsx - Modal Component
 ** Renders a dialog prompt that confirms whether or not to delete a Review.
 ** Note: Uses Modal.css for formatting. Any unique rules would be in SpotDetails.css
*/

import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { deleteReview } from '../../store/reviews';

/** Component Props:
 *  @param reviewId (number) - The id of the Spot to add this Review to.
*/
export default function DeleteReviewModal({ reviewId }) {
    const dispatch = useDispatch()
    const { closeModal } = useModal();

    const handleDelete = () => dispatch(deleteReview(reviewId))
    .then(closeModal)
    .catch(async (res) => {
        const data = await res.json();
        alert(data.message);
    })
    

    return (<>
        {/* Modal Title */}
        <h1 className='modal-title'>Confirm Delete</h1>

        {/* Modal Infotext */}
        <p className='modal-infotext'>Are you sure you want to delete this review?</p>

        {/* Delete Confirmation Button */}
        <button className='modal-button-delete' onClick={handleDelete}>Yes (Delete Review)</button>

        {/* Delete Cancellation Button */}
        <button className='modal-button' onClick={closeModal}>No (Keep Review)</button>
    </>)
}