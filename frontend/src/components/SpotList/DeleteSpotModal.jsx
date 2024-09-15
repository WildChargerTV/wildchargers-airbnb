/** src/components/SpotList/DeleteSpotModal.jsx - Modal Component
 ** Renders a dialog prompt that confirms whether or not to delete a Spot.
 ** Note: Uses Modal.css for formatting. Any unique rules would be in SpotList.css
*/

import { useModal } from '../../context/Modal';

/** Component Props:
 *  @param spotId (number) - The id of the Spot to add this Review to.
*/
export default function DeleteSpotModal({ spotId }) {
    const { closeModal } = useModal();

    const handleDelete = () => {
        console.log(spotId);
    }

    return (<>
        {/* Modal Title */}
        <h1 className='modal-title'>Confirm Delete</h1>

        {/* Modal Infotext */}
        <p className='modal-infotext'>Are you sure you want to remove this spot from the listings?</p>

        {/* Delete Confirmation Button */}
        <button className='modal-button-delete' onClick={handleDelete}>Yes (Delete Spot)</button>

        {/* Delete Cancellation Button */}
        <button className='modal-button' onClick={closeModal}>No (Keep Spot)</button>
    </>)
}