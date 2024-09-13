//import { useNavigate } from "react-router-dom";
import DeleteSpotModal, { OpenDeleteSpotModal } from "./DeleteSpotModal";

function SingleSpot({ spot, current }) {
    //const navigate = useNavigate();

    const closeModal = () => true;

    return (<div className='spot-tile'>
        <img className='spot-tile__preview-image' src={spot.previewImage} alt={spot.description} />
        <h3 className='spot-tile__location-price'>{spot.city}, {spot.state}<br />${spot.price}<small>/night</small></h3>
        {spot.avgRating ? <h3 className='spot-tile__rating'>★ {spot.avgRating.toFixed(1)}</h3> : <h3 className='spot-tile__rating'>New</h3>}
        {current ? <div className='spot-tile__controls'>
            <button id='spot-tile__controls-update' onClick={(e) => e.preventDefault()}>Update</button>
            <OpenDeleteSpotModal modalComponent={DeleteSpotModal} buttonText='Delete' onModalClose={closeModal} />
        </div> : null}
    </div>)
}

export default SingleSpot;