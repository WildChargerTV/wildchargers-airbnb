import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import SingleSpot from './SingleSpot';
import { getSpots } from '../../store/spots';
import './SpotList.css';

function SpotList() {
    const dispatch = useDispatch();
    const allSpots = useSelector((state) => state.spot.Spots);

    useEffect(() => { dispatch(getSpots()) }, [dispatch]);

    return (<main id='spot-list'>
        {allSpots?.map((spot) => <NavLink key={spot.id} to={`/spots/${spot.id}`}>
            <SingleSpot spot={spot} />
        </NavLink>)}
    </main>);
}

export default SpotList;