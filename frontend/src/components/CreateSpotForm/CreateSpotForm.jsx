import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSpot } from '../../store/spots';
import './CreateSpotForm.css';

function CreateSpotForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [spotState, setSpotState] = useState('');
    const [country, setCountry] = useState('');
    const [lat, setLat] = useState(0.0);
    const [lng, setLng] = useState(0.0);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [images, setImages] = useState({});
    const [errors, setErrors] = useState({});

    const setPreviewImage = (e) => {
        const newImages = structuredClone(images);
        newImages['preview'] = e.target.value;
        setImages(newImages);
    }

    const setSpotImage = (e) => {
        const imgNum = e.imgNum,
              newImages = structuredClone(images);
        newImages[imgNum] = e.target.value;
        setImages(newImages);
    }

    const populateImageInputs = () => {
        const fields = [];
        for(let i = 2; i <= 5; i++) {
            fields.push(<>
                <input id={`spot-img-${i}`} type='url' name={`img${i}`} placeholder={`Image URL ${i}`} value={images[i - 1]} 
                    onChange={(e) => {e.imgNum = i; return setSpotImage(e);}} 
                />
                <small>{errors[`image${i}`] && <p className='spot-info__error'>{errors[`image${i}`]}</p>}</small>
            </>)
        }
        return fields;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        let newSpotId;
        dispatch(createSpot({
            state: spotState,
            address, city, country, lat, lng, name, description, price, images
        })).catch(async (res) => {
            const data = res.json();
            console.warn(data);
            newSpotId = data.id;
            navigate(`/spots/${newSpotId}`);
        });

    }

    return (<main id='site-create-spot'>
        <h1>Create a New Spot</h1>
        <form id='spot-info' onSubmit={handleSubmit}>
            <section id='spot-location'>
                {/* Section Title & Description */}
                <h2>Where&apos;s your place located?</h2>
                <p>Guests will only get your exact address once they have booked a reservation.</p>

                {/* Country & Street Address */}
                <label id='spot-country' htmlFor='country'>
                    Country <small>{errors.country && <p className='spot-info__error'>{errors.country}</p>}</small><br />
                    <input name='country' placeholder='Country' value={country} onChange={(e) => setCountry(e.target.value)} required />
                </label>
                <label id='spot-address' htmlFor='address'>
                    Street Address <small>{errors.address && <p className='spot-info__error'>{errors.address}</p>}</small><br />
                    <input name='address' placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} required />
                </label>

                {/* City & State Inline */}
                <label id='spot-city' htmlFor='city'>
                    City <small>{errors.city && <p className='spot-info__error'>{errors.city}</p>}</small><br />
                    <input name='city' placeholder='City' value={city} onChange={(e) => setCity(e.target.value)} required />
                    <span>,</span>
                </label>
                <label id='spot-state' htmlFor='state'>
                    State <small>{errors.state && <p className='spot-info__error'>{errors.state}</p>}</small><br />
                    <input name='state' placeholder='STATE' value={spotState} onChange={(e) => setSpotState(e.target.value)} required />
                </label>

                {/* Latitude & Longitude Inline */}
                <label id='spot-lat' htmlFor='latitude'>
                    Latitude <small>{errors.lat && <p className='spot-info__error'>{errors.lat}</p>}</small><br />
                    <input type='number' name='latitude' placeholder='Latitude' value={lat} onChange={(e) => setLat(e.target.value)} required />
                    <span>,</span>
                </label>
                <label id='spot-lng' htmlFor='longitude'>
                    Longitude <small>{errors.lng && <p className='spot-info__error'>{errors.lng}</p>}</small><br />
                    <input type='number' name='longitude' placeholder='Longitude' value={lng} onChange={(e) => setLng(e.target.value)} required />
                </label>
            </section>
            <section id='spot-desc'>
                {/* Section Title & Description */}
                <h2>Describe your place to guests</h2>
                <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>

                {/* Description */}
                <textarea id='spot-description' name='description' placeholder='Please write at least 30 characters' value={description} onChange={(e) => setDescription(e.target.value)} required />
                <br /><small>{errors.description && <p className='spot-info__error'>{errors.description}</p>}</small>
            </section>
            <section id='spot-title'>
                {/* Section Title & Description */}
                <h2>Create a title for your spot</h2>
                <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>

                {/* Name */}
                <input id='spot-name' name='name' placeholder='Name of your spot' value={name} onChange={(e) => setName(e.target.value)} required />
                <br /><small>{errors.name && <p className='spot-info__error'>{errors.name}</p>}</small>
            </section>
            <section id='spot-base-price'>
                {/* Section Title & Description */}
                <h2>Set a base price for your spot</h2>
                <p>Competitive pricing can help your listing stand out and rank higher in search results. Amount must be in USD.</p>

                {/* Price */}
                <label id='spot-price' htmlFor='price'>
                    <span>$ </span>
                    <input id='spot-price' type='number' name='price' placeholder='Price per night (USD)' value={price} onChange={(e) => setPrice(e.target.value)} required />
                </label>
                <small>{errors.price && <p className='spot-info__error'>{errors.price}</p>}</small>
            </section>
            <section id='spot-images'>
                {/* Section Title & Description */}
                <h2>Liven up your spot with photos</h2>
                <p>Submit a link to at least one photo to publish your spot.</p>

                {/* Images */}
                <input id='spot-preview-img' type='url' name='previewImage' placeholder='Preview Image URL' value={images[0]} onChange={setPreviewImage} required />
                <small>{errors.previewImage && <p className='spot-info__error'>{errors.previewImage}</p>}</small>
                {populateImageInputs().map((field) => field)}
            </section>
            <button id='spot-info__submit' type='submit'>Create Spot</button>
        </form>
    </main>)
}

export default CreateSpotForm;