import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SingleReview from './SingleReview';
import { getReviewsBySpot } from '../../store/reviews';
import { getSpotById } from '../../store/spots';
import './SpotDetails.css';

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const spot = useSelector((state) => state.spot);
    const reviews = useSelector((state) => state.review.Reviews);

    const handleReserve = () => alert("Feature coming soon!");

    useEffect(() => {
        dispatch(getSpotById(spotId));
        dispatch(getReviewsBySpot(spotId));
    }, [dispatch, spotId]);

    // Handler to prevent rendering error before fetch is complete
    if(!spot?.SpotImages) return null;

    const reviewString = () => {
        if(!spot.numReviews) return null;
        else return (<>
            {' · ' + spot.numReviews + ' '}
            <small>{spot.numReviews > 1 ? 'reviews' : 'review'}</small>
        </>);
    }

    return (<main id='site-spot-details'>
        <div id='spot-detail'>
            <h1 id='spot-title'>{spot.name}</h1>
            <h2 id='spot-location'>{spot.city}, {spot.state}, {spot.country}</h2>
            <div id='spot-gallery'>{spot?.SpotImages.map((img) => <img key={img.id} src={img.url} />)}</div>

            <h2 id='spot-host'>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</h2>
            <p id='spot-description'>{spot.description}</p>
            <div id='spot-reserve-panel'>
                <h3 id='spot-price'>${spot.price}<small>/night</small></h3>
                <h3 id='spot-rating-reviews'>
                    ★{spot.avgStarRating.toFixed(1)}
                    {reviewString()}
                </h3>
                <button id='spot-reserve-btn' onClick={handleReserve}>Reserve</button>
            </div>
        </div>
        <div id='spot-reviews'>
            <h2>
                ★{spot.avgStarRating.toFixed(1)}
                {reviewString()}
            </h2>
            {reviews.length ? 
                reviews.map((review) => <SingleReview key={review.id} review={review} />) :
                <h2>Be the first to post a review!</h2>
            }
        </div>
    </main>)
}

export default SpotDetails;