const MONTHS = ['January', 'February', 'March',
                'April', 'May', 'June',
                'July', 'August', 'September',
                'October', 'November', 'December'];

function SingleReview({ review }) {
    const createdDate = new Date(review.createdAt);

    return (<div className='review-tile'>
        <h3 className='review-tile__user-name'>User firstName placeholder</h3>
        <h4 className='review-tile__date'>{MONTHS[createdDate.getMonth() - 1]} {createdDate.getFullYear()}</h4>
        <p className='review-tile__review'>{review.review}</p>
    </div>)
}

export default SingleReview;