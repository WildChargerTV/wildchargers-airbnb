/** src/components/SpotDetails/SpotDetails.jsx - Main Component
 ** Renders the details and Reviews of a single Spot.
 *  TODO: Elements on this page are negatively impacted by SpotForm.css' rules on section elements.
 *  TODO: The Spot Image Gallery needs to be tested for a Spot with all 5 images filled out.
 *  TODO: The Reviews list needs to be sorted by date!
*/

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CreateReviewModal from './CreateReviewModal';
import SingleReview from './SingleReview';
import { useModal } from '../../context/Modal';
import { getReviewsBySpot } from '../../store/reviews';
import { getSpotById } from '../../store/spots';
import './SpotDetails.css';

/** Helper Component OpenCreateReviewModal 
 ** Prepares an element to interact directly with the Modal context.
 *  Component Props:
 *  @param modalComponent (Component) - The Component that will be displayed as the modal's content.
 *  @param buttonText (string) - The text that will be rendered on the returned element.
 *  @param onButtonClick (function) - A passthru onClick method to attach to the returned element.
 *  @param onModalClose (function) (Optional) - A function to execute once the modal has closed.
*/ 
function OpenCreateReviewModal({ modalComponent, buttonText, onButtonClick, onModalClose }) {
    const { setModalContent, setOnModalClose } = useModal();

    // Initiate the modal's opening.
    const onClick = () => {
        if (onModalClose) setOnModalClose(() => onModalClose);
        setModalContent(modalComponent);
        if (typeof onButtonClick === 'function') onButtonClick();
    }

    return <button onClick={onClick}>{buttonText}</button>
}

/* No Component Props */
export default function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user);
    const spot = useSelector((state) => state.spot);
    const reviews = useSelector((state) => state.review.Reviews);

    // Reservations are not required for this project.
    const handleReserve = () => alert("Feature coming soon!");

    // When the modal to create a Review closes, re-dispatch for new ratings numbers & reviews.
    const closeModal = () => {
        dispatch(getSpotById(spotId));
        dispatch(getReviewsBySpot(spotId));
    }

    // Get the Spot's details & Reviews.
    useEffect(() => {
        dispatch(getSpotById(spotId));
        dispatch(getReviewsBySpot(spotId));
    }, [dispatch, spotId]);

    // Handler to prevent rendering error before fetch is complete.
    if(!spot?.SpotImages || !reviews) return null;

    // Assemble the string displaying the Spot's average star rating & Review count.
    const reviewString = () => <>
        ★{spot?.avgStarRating?.toFixed(1) || ' New'}
        {spot.numReviews > 0 && <>
            {' · ' + spot.numReviews + ' '}
            <small>{spot.numReviews > 1 ? 'reviews' : 'review'}</small>
        </>}
    </>
    
    /** Determine if the Create Review button should be rendered based on the following checks:
     *  Check 1: Is there a current User?
     *  Check 2: Has the User posted a Review to the Spot already?
     *  Check 3: Does the User own the Spot?
     */
    const showCreateReviewButton = () => (
        sessionUser && 
        !reviews?.find((review) => review.userId == sessionUser.id) && 
        spot.ownerId !== sessionUser.id
    );

    return (<main id='site-spot-details'>
        {/* Section 1: Spot Details */}
        <section id='spot-detail'>
            {/* Spot Name & Location */}
            <h1 id='spot-detail__title'>{spot.name}</h1>
            <h2 id='spot-detail__location'>{spot.city}, {spot.state}, {spot.country}</h2>

            {/* Spot Image Gallery */}
            <div id='spot-detail__gallery'>
                {spot?.SpotImages.map((img) => <img 
                    key={img.id} 
                    src={img.url} 
                    alt={`${spot.name} ${img.id}`} 
                />)}
            </div>

            {/* Spot Host Name & Description */}
            <h2 id='spot-detail__host'>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</h2>
            <p id='spot-detail__description'>{spot.description}</p>
            
            {/* Spot Reservation Panel - displays price, star rating, and review count. Reservations not implemented */}
            <div id='spot-detail__reserve-panel'>
                <h3 id='spot-detail__price'>
                    ${spot.price}
                    <small>/night</small>
                </h3>
                <h3 id='spot-detail__rating-reviews'>{reviewString()}</h3>
                <button id='spot-detail__reserve-btn' onClick={handleReserve}>Reserve</button>
            </div>
        </section>

        {/* Section 2: Spot Reviews */}
        <section id='spot-reviews'>
            {/* Spot Star Rating & Review Count */}
            <h2>{reviewString()}</h2>

            {/* Create Review Button - appears only if requirements in showCreateReviewButton are met */}
            {showCreateReviewButton() &&
                <OpenCreateReviewModal 
                    modalComponent={<CreateReviewModal spotId={spot.id} />} 
                    buttonText='Post Your Review' 
                    onButtonClick={null} 
                    onModalClose={closeModal} 
                />
            }

            {/* Spot Reviews - lists all existing reviews, sorted by descending date order. If none exist, a header appears prompting the user to leave the first one */}
            {reviews?.length ? 
                reviews
                .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((review) => <SingleReview key={review.id} review={review} />) :
                <h2>Be the first to post a review!</h2>
            }
        </section>
    </main>)
}