import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import SingleSpot from './SingleSpot';
import { getSpots, getCurrentSpots } from '../../store/spots';
import './SpotList.css';

function SpotList({ current }) {
    const dispatch = useDispatch();
    const allSpots = useSelector((state) => state.spot.Spots);

    useEffect(() => { 
        if(current) dispatch(getCurrentSpots());
        else dispatch(getSpots());
    }, [dispatch, current]);

    const filteredSpots = allSpots?.filter((spot) => spot.id !== null);
    console.log(filteredSpots);

    return (<main id='spot-list'>
        {current ? <h1>Manage Spots</h1> : null}
        {(current && !filteredSpots?.length) ? <NavLink to='/spots/new'><button className='site-header__button'>Create a new Spot</button></NavLink> : null}
        <div id='spot-list__grid'>
            {filteredSpots?.map((spot) => <NavLink key={spot.id} to={`/spots/${spot.id}`}><SingleSpot spot={spot} current={current} /></NavLink>)}
        </div>
    </main>);
}

export default SpotList;