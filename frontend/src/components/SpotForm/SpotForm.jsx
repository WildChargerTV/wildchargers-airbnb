/** src/components/SpotForm/SpotForm.jsx - Main Component
 ** Renders a large form that allows for the creation & modification of Spots.
 *  TODO: The form submission button needs to be wrapped in a flexbox to properly center align
 *  TODO: The concept of just deleting all the old images and re-inserting them is massively inefficient. Patch this
*/

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addImageToSpot, createSpot, deleteSpotImage, editSpot, getSpotById } from '../../store/spots';
import './SpotForm.css';

/* No Component Props */
export default function SpotForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { spotId } = useParams();
    const spot = useSelector((state) => state.spot);
    const [editMode, setEditMode] = useState(spotId !== undefined);
    const [errors, setErrors] = useState({});

    // If a spotId is defined, grab the associated Spot, and enable edit mode.
    useEffect(() => {
        spotId && dispatch(getSpotById(spotId));
        setEditMode(spotId !== undefined);
    }, [dispatch, spotId]);

    // Set up a tempImgState, which will transfer the Spot's SpotImages array into an object for the State to use.
    // const tempImgState = {};
    // editMode && (() => {
    //     tempImgState['preview'] = spot?.SpotImages[0]?.url;
    //     tempImgState['1'] = spot?.SpotImages[1]?.url;
    //     tempImgState['2'] = spot?.SpotImages[2]?.url;
    //     tempImgState['3'] = spot?.SpotImages[3]?.url;
    //     tempImgState['4'] = spot?.SpotImages[4]?.url;
    // })();

    // Create form state variables.
    const [country, setCountry] = useState(spot ? spot.country : '');
    const [address, setAddress] = useState(spot ? spot.address : '');
    const [city, setCity] = useState(spot ? spot.city : '');
    const [spotState, setSpotState] = useState(spot ? spot.state : '');
    const [lat, setLat] = useState(spot ? spot.lat : 0.0);
    const [lng, setLng] = useState(spot ? spot.lng : 0.0);
    const [description, setDescription] = useState(spot ? spot.description : '');
    const [name, setName] = useState(spot ? spot.name : '');
    const [price, setPrice] = useState(spot ? spot.price : 0);
    const [images, setImages] = useState({});
    
    // Custom handler to edit the preview image.
    const setPreviewImage = (e) => {
        const newImages = structuredClone(images);
        newImages['preview'] = e.target.value;
        setImages(newImages);
    }

    // More custom handlers to update individual image fields. Distributed into populateImageInputs.
    const setSpotImage = (e) => {
        const imgNum = e.imgNum,
              newImages = structuredClone(images);
        newImages[imgNum] = e.target.value;
        setImages(newImages);
    }

    // Create the four other input lines for image URLs. Required so that all of the image URLs can remain in one state variable.
    const populateImageInputs = () => {
        const fields = [];
        for(let i = 2; i <= 5; i++) {
            fields.push(<>
                <input 
                    id={`spot-img-${i}`} 
                    type='url' 
                    name={`img${i}`} 
                    placeholder={`Image URL ${i}`} 
                    value={images[i - 1]} 
                    onChange={(e) => {e.imgNum = i; return setSpotImage(e);}} 
                />
                <small>{errors[`image${i}`] && 
                    <p className='spot-info__error'>{errors[`image${i}`]}</p>
                }</small>
            </>);
        }
        return fields;
    }

    /** Handle form submission.
     *  In edit mode,
    */
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        let newSpotId;
        return (editMode ?
            dispatch(editSpot({ state: spotState, address, city, country, lat, lng, name, description, price, images }, spotId))
            .then(dispatch(getSpotById(spotId)))
            .then(() => {for(let img of spot.SpotImages) dispatch(deleteSpotImage(img.id))})
            .then(navigate(`/spots/${spotId}`))
            .catch(async (res) => {
                const data = await res.json();
                if(data?.errors) setErrors(data.errors);
                else if(data?.message) setErrors(data);
            }) : 
            dispatch(createSpot({ state: spotState, address, city, country, lat, lng, name, description, price }))
            .then(() => {
                newSpotId = spot.id;
                dispatch(addImageToSpot({
                    url: images['preview'],
                    preview: true
                }, newSpotId))
                .then(navigate(`/spots/${newSpotId}`));
            })
            .catch(async (res) => {
                const data = await res.json();
                if(data?.errors) setErrors(data.errors);
                else if(data?.message) setErrors(data);
            })
        )
    }

    return (<main id='site-create-spot'>
        {/* Page Header - text changes based on editMode */}
        <h1>
            {editMode ? 'Edit your Spot' : 'Create a New Spot'}
        </h1>

        {/* Spot Information Form */}
        <form id='spot-info' onSubmit={handleSubmit}>
            {/* Section 1: Spot Location */}
            <section id='spot-location'>
                {/* Section Title & Description */}
                <h2>Where&apos;s your place located?</h2>
                <p>Guests will only get your exact address once they have booked a reservation.</p>

                {/* Country & Street Address */}
                <label id='spot-country'>
                    Country{' '}
                    <small>{errors.country && <p className='spot-info__error'>{errors.country}</p>}</small>
                    <br />
                    <input 
                        type='text'
                        placeholder='Country' 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)} 
                        required
                    />
                </label>
                <label id='spot-address'>
                    Street Address{' '}
                    <small>{errors.address && <p className='spot-info__error'>{errors.address}</p>}</small>
                    <br />
                    <input 
                        type='text' 
                        placeholder='Address' 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                    />
                </label>

                {/* City & State Inline */}
                <label id='spot-city'>
                    City{' '}
                    <small>{errors.city && <p className='spot-info__error'>{errors.city}</p>}</small>
                    <br />
                    <input 
                        type='text' 
                        placeholder='City' 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        required 
                    />
                    <span>,</span>
                </label>
                <label id='spot-state'>
                    State{' '}
                    <small>{errors.state && <p className='spot-info__error'>{errors.state}</p>}</small>
                    <br />
                    <input 
                        type='text' 
                        placeholder='State' 
                        value={spotState} 
                        onChange={(e) => setSpotState(e.target.value)} 
                        required 
                    />
                </label>

                {/* Latitude & Longitude Inline */}
                <label id='spot-lat'>
                    Latitude{' '}
                    <small>{errors.lat && <p className='spot-info__error'>{errors.lat}</p>}</small>
                    <br />
                    <input 
                        type='number' 
                        placeholder='Latitude' 
                        value={lat} 
                        onChange={(e) => setLat(e.target.value)} 
                        required 
                    />
                    <span>,</span>
                </label>
                <label id='spot-lng'>
                    Longitude{' '}
                    <small>{errors.lng && <p className='spot-info__error'>{errors.lng}</p>}</small>
                    <br />
                    <input 
                        type='number' 
                        placeholder='Longitude' 
                        value={lng} 
                        onChange={(e) => setLng(e.target.value)} 
                        required 
                    />
                </label>
            </section>

            {/* Section 2: Spot Description */}
            <section id='spot-desc'>
                {/* Section Title & Description */}
                <h2>Describe your place to guests</h2>
                <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>

                {/* Description */}
                <textarea 
                    id='spot-description' 
                    placeholder='Please write at least 30 characters' 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                />
                <br />
                <small>{errors.description && <p className='spot-info__error'>{errors.description}</p>}</small>
            </section>

            {/* Section 3: Spot Name */}
            <section id='spot-title'>
                {/* Section Title & Description */}
                <h2>Create a title for your spot</h2>
                <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>

                {/* Name */}
                <input 
                    id='spot-name' 
                    type='text'
                    placeholder='Name of your spot' 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
                <br />
                <small>{errors.name && <p className='spot-info__error'>{errors.name}</p>}</small>
            </section>

            {/* Section 4: Spot Price */}
            <section id='spot-base-price'>
                {/* Section Title & Description */}
                <h2>Set a base price for your spot</h2>
                <p>Competitive pricing can help your listing stand out and rank higher in search results. Amount must be in USD.</p>

                {/* Price */}
                <label id='spot-price'>
                    <span>$ </span>
                    <input 
                        id='spot-price' 
                        type='number'  
                        placeholder='Price per night (USD)' 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        required 
                    />
                </label>
                <small>{errors.price && <p className='spot-info__error'>{errors.price}</p>}</small>
            </section>

            {/* Section 5: Spot Images */}
            <section id='spot-images'>
                {/* Section Title & Description */}
                <h2>Liven up your spot with photos</h2>
                <p>Submit a link to at least one photo to publish your spot.</p>

                {/* Images */}
                <input 
                    id='spot-preview-img' 
                    type='url' 
                    placeholder='Preview Image URL' 
                    value={images['preview']} 
                    onChange={setPreviewImage} 
                    required 
                />
                <small>{errors.previewImage && <p className='spot-info__error'>{errors.previewImage}</p>}</small>
                {populateImageInputs().map((field) => field)}
            </section>

            {/* Submit Button - text changes based on editMode */}
            <button id='spot-info__submit' type='submit'>
                {editMode ? 'Update your Spot' : 'Create Spot'}
            </button>
        </form>
    </main>)
}