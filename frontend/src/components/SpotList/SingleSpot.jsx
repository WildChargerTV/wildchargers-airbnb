function SingleSpot({ spot }) {
    return (<div className='spot-tile'>
        <img className='spot-tile__preview-image' src={spot.previewImage} alt={spot.description} />
        <h3 className='spot-tile__location-price'>{spot.city}, {spot.state}<br />${spot.price}<small>/night</small></h3>
        {spot.avgRating ? <h3 className='spot-tile__rating'>★ {spot.avgRating.toFixed(1)}</h3> : <h3 className='spot-tile__rating'>New</h3>}
    </div>)
}

export default SingleSpot;