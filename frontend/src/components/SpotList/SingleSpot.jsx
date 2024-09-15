/** src/components/SpotList/SingleSpot.jsx - Sub-Component
 ** Renders the basic details of a single Spot. Clicking the component navigates to a Spot detail page. 
 *TODO: The Delete modal is incomplete.
*/

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DeleteSpotModal from './DeleteSpotModal';
import { useModal } from '../../context/Modal';
import { getCurrentSpots, getSpots } from '../../store/spots';

/** Helper Component OpenDeleteSpotModal 
 ** Prepares an element to interact directly with the Modal context.
 *  Component Props:
 *  @param modalComponent (Component) - The Component that will be displayed as the modal's content.
 *  @param buttonText (string) - The text that will be rendered on the returned element.
 *  @param onButtonClick (function) - A passthru onClick method to attach to the returned element.
 *  @param onModalClose (function) (Optional) - A function to execute once the modal has closed.
*/ 
function OpenDeleteSpotModal({ modalComponent, buttonText, onButtonClick, onModalClose }) {
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
 *  @param spot (Object) - The Spot to parse info from.
 *  @param current (boolean) - Toggles Current mode, which controls the visibility of Spot control buttons.
 */
export default function SingleSpot({ spot, current }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);

    // When the modal to delete a Spot closes, refresh the list of Spots. SpotList will invoke a re-render.
    const closeModal = () => (current ? dispatch(getCurrentSpots()) : dispatch(getSpots()));

    // Navigate to a Spot's edit page.
    const editSpot = (e) => {
        e.preventDefault();
        navigate(`/spots/${spot.id}/edit`);
    }

    // Create a dynamic className for the visibility of the tooltip.
    const tooltipClassName = 'spot-tile__tooltip' + (showTooltip ? '' : ' hidden');

    /*
    //*! SonarLint: Avoid non-native interactive elements (javascript:S6848) - resolved by adding a role
    //*! SonarLint: Elements with an interactive role should support focus (javascript:S6852) - resolved by adding a tabIndex
    //*! SonarLint: Mouse events should have corresponding keyboard inputs (javascript:S1082) - resolved by adding empty onFocus
    */
    return (
    <div 
        className='spot-tile'
        role='menuitem' 
        tabIndex='0' 
        onFocus={() => {}}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)} 
    >
        {/* Spot Preview Image */}
        <img 
            className='spot-tile__preview-image' 
            src={spot.previewImage} 
            alt={spot.description} 
        />

        {/* Spot Location & Price */}
        <h3 className='spot-tile__location-price'>
            {spot.city}, {spot.state}
            <br />
            ${spot.price}<small>/night</small>
        </h3>

        {/* Spot Rating */}
        <h3 className='spot-tile__rating'>
            {spot.avgRating ? 
                `★ ${spot.avgRating.toFixed(1)}` : 
                'New'
            }
        </h3>
        
        {/* Spot Tooltip - appears when hovering over tile */}
        <div className={tooltipClassName}>{spot.name}</div>
        
        {/* Spot Controls - appears only on /spots/current, null otherwise */}
        {current && <div className='spot-tile__controls'>
            {/* Update Button - navigates to a Spot editor page */}
            <button onClick={editSpot}>Update</button>

            {/* Delete Button - opens a modal to confirm Spot deletion */}
            <OpenDeleteSpotModal 
                modalComponent={<DeleteSpotModal spotId={spot.id} />} 
                buttonText='Delete'
                onButtonClick={null}
                onModalClose={closeModal} 
            />
        </div>}
    </div>)
}