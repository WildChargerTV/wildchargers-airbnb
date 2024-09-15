/** src/components/SpotList/SpotList.jsx - Main Component
 ** Used for site homepage. Renders a list of Spots in grid layout.
 *  TODO: Create New Spot button currently uses CSS rules for site header. Change to own reference
*/

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import SingleSpot from './SingleSpot';
import { getSpots, getCurrentSpots } from '../../store/spots';
import './SpotList.css';

/** Component Props:
 *  @param current (boolean) - Tells the component whether or not to render in Current mode (all Spots owned by current User only).
*/
export default function SpotList({ current }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const allSpots = useSelector((state) => state.spot.Spots);

    /* If in Current mode, get all Spots owned by the current User. Otherwise, just load all Spots. */
    useEffect(() => { 
        if(current) dispatch(getCurrentSpots());
        else dispatch(getSpots());
    }, [dispatch, current]);

    return (<main id='spot-list'>
        {/* Page Header - appears only in Current mode */}
        {current && <h1>Manage Spots</h1>}

        {/* Create New Spot Button - appears only in Current mode, when the User owns no Spots */}
        {(current && !allSpots?.length) && 
            <button className='site-header__button' onClick={() => navigate('/spots/new')}>Create a new Spot</button> 
        }

        {/* Spot List - Renders all of the Spots returned from the dispatch call */}
        <div id='spot-list-grid'>
            {allSpots?.map((spot) => 
                <NavLink key={spot.id} to={`/spots/${spot.id}`}>
                    <SingleSpot spot={spot} current={current} />
                </NavLink>
            )}
        </div>
    </main>);
}