import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CreateReviewModal, { OpenCreateReviewModal } from './CreateReviewModal';
import SingleReview from './SingleReview';
import { getReviewsBySpot } from '../../store/reviews';
import { getSpotById } from '../../store/spots';
import './SpotDetails.css';

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user);
    const spot = useSelector((state) => state.spot);
    const reviews = useSelector((state) => state.review.Reviews);

    const handleReserve = () => alert("Feature coming soon!");
    const closeModal = () => false;

    useEffect(() => {
        dispatch(getSpotById(spotId));
        dispatch(getReviewsBySpot(spotId));
    }, [dispatch, spotId, reviews]);

    // Handler to prevent rendering error before fetch is complete
    if(!spot?.SpotImages || !reviews) return null;

    const reviewString = () => {
        if(!spot.numReviews) return null;
        else return (<>
            {' · ' + spot.numReviews + ' '}
            <small>{spot.numReviews > 1 ? 'reviews' : 'review'}</small>
        </>);
    }
    const userReviewExists = () => (sessionUser && !reviews?.find((review) => review.userId == sessionUser.id) && spot.ownerId !== sessionUser.id);

    return (<main id='site-spot-details'>
        <div id='spot-detail'>
            <h1 id='spot-detail__title'>{spot.name}</h1>
            <h2 id='spot-detail__location'>{spot.city}, {spot.state}, {spot.country}</h2>
            <div id='spot-detail__gallery'>{spot?.SpotImages.map((img) => <img key={img.id} src={img.url} />)}</div>

            <h2 id='spot-detail__host'>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</h2>
            <p id='spot-detail__description'>{spot.description}</p>
            <div id='spot-detail__reserve-panel'>
                <h3 id='spot-detail__price'>${spot.price}<small>/night</small></h3>
                <h3 id='spot-detail__rating-reviews'>
                    ★{spot?.avgStarRating?.toFixed(1) || ' New'}
                    {reviewString()}
                </h3>
                <button id='spot-detail__reserve-btn' onClick={handleReserve}>Reserve</button>
            </div>
        </div>
        <div id='spot-reviews'>
            <h2>
                ★{spot?.avgStarRating?.toFixed(1) || ' New'}
                {reviewString()}
            </h2>
            {userReviewExists() ?
                <OpenCreateReviewModal modalComponent={<CreateReviewModal spotId={ spot.id } />} buttonText='Post Your Review' onButtonClick={null} onModalClose={closeModal} /> : null }
            {reviews.length ? 
                reviews.map((review) => <SingleReview key={review.id} review={review} />) :
                <h2>Be the first to post a review!</h2>}
        </div>
    </main>)
}

export default SpotDetails;