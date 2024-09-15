/** src/components/SpotDetails/SingleReview.jsx - Sub-Component
 ** Renders the details for a single Review of a Spot.
*/

// An array of months to correspond to a Date's getMonth().
const MONTHS = [
    'January', 'February', 'March',        
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
];

/** Component Props:
 *  @param review (object) - The Review to parse and display.
*/
export default function SingleReview({ review }) {
    // Grab the Review's creation date
    const createdDate = new Date(review.createdAt);

    return (<div className='review-tile'>
        {/* Review Owner's First Name */}
        <h3 className='review-tile__user-name'>{review.User.firstName}</h3>

        {/* Review Date - format is "[Month Name] [Full Year]" */}
        <h4 className='review-tile__date'>
            {MONTHS[createdDate.getMonth()] + ' '}
            {createdDate.getFullYear()}
        </h4>

        {/* Review Body */}
        <p className='review-tile__review'>{review.review}</p>
    </div>)
}