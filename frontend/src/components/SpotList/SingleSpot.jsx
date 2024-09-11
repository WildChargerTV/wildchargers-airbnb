
function SingleSpot({ spot }) {
    return (<div className='spot-list__tile'>
        <img src={spot.previewImage} />
        <h2>{spot.city}, {spot.state}</h2>
        <p>${spot.price}/night</p>
        <p>★{spot.avgRating.toFixed(1)}</p>
    </div>)
}

export default SingleSpot;