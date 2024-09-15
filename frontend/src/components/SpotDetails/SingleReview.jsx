/** src/components/SpotDetails/SingleReview.jsx - Sub-Component
 ** Renders the details for a single Review of a Spot.
 *  TODO (Optional): Consider consolidating DeleteSpotModal and DeleteReviewModal
*/

import { useDispatch, useSelector } from 'react-redux';
import DeleteReviewModal from './DeleteReviewModal';
import { useModal } from '../../context/Modal';
import { getReviewsBySpot } from '../../store/reviews';
import { getSpotById } from '../../store/spots';

// An array of months to correspond to a Date's getMonth().
const MONTHS = [
    'January', 'February', 'March',        
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
];

/** Helper Component OpenDeleteReviewModal 
 ** Prepares an element to interact directly with the Modal context.
 *  Component Props:
 *  @param modalComponent (Component) - The Component that will be displayed as the modal's content.
 *  @param buttonText (string) - The text that will be rendered on the returned element.
 *  @param onButtonClick (function) - A passthru onClick method to attach to the returned element.
 *  @param onModalClose (function) (Optional) - A function to execute once the modal has closed.
*/ 
function OpenDeleteReviewModal({ modalComponent, buttonText, onButtonClick, onModalClose }) {
    const { setModalContent, setOnModalClose } = useModal();

    // Initiate the modal's opening.
    const onClick = (e) => {
        e.preventDefault();
        if (onModalClose) setOnModalClose(() => onModalClose);
        setModalContent(modalComponent);
        if (typeof onButtonClick === 'function') onButtonClick();
    }

    return <button onClick={onClick}>{buttonText}</button>
}

/** Component Props:
 *  @param review (object) - The Review to parse and display.
*/
export default function SingleReview({ review }) {
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user);

    // When the modal to create a Review closes, re-dispatch for new ratings numbers & reviews.
    const closeModal = () => {
        dispatch(getSpotById(review.spotId));
        dispatch(getReviewsBySpot(review.spotId));
    }

    // Grab the Review's creation date.
    const createdDate = new Date(review.createdAt);

    return (<div className='review-tile'>
        {/* Review Owner's First Name */}
        <h3 className='review-tile__user-name'>{review.User.firstName}</h3>

        {/* Review Date - format is "[Month Name] [Full Year]" */}
        <h4 className='review-tile__date'>
            {MONTHS[createdDate.getMonth()] + ' '}
            {createdDate.getFullYear()}
        </h4>

        {/* Review Body */}
        <p className='review-tile__review'>{review.review}</p>

        {/* Delete Review Button - only appears if the current User is the Review's owner */}
        {(review.userId === sessionUser.id) &&
            <OpenDeleteReviewModal
                modalComponent={<DeleteReviewModal reviewId={review.id} />}
                buttonText='Delete'
                onButtonClick={null}
                onModalClose={closeModal}
            />
        }
    </div>)
}