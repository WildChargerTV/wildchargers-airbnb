/** src/components/Navigation/ProfileButton.jsx - Sub-Component
 ** Renders a button that shows a dropdown list of profile options.
 ** This is the primary method to log in/out, sign up, and access profile details.
 *  TODO: Change the return of OpenModalMenuItem to include a <button> element
 *  TODO: CSS Cleanup
*/

import { useState, useEffect, useRef } from 'react';
import { MdAccountCircle, MdDehaze } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import LoginFormModal from './LoginFormModal';
import SignupFormModal from './SignupFormModal';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';

/** Helper Component OpenModalMenuItem 
 ** Prepares an element to interact directly with the Modal context.
 *  Component Props:
 *  @param modalComponent (Component) - The Component that will be displayed as the modal's content.
 *  @param itemText (string) - The text that will be rendered on the returned element.
 *  @param onItemClick (function) - A passthru onClick method to attach to the returned element.
 *  @param onModalClose (function) (Optional) - A function to execute once the modal has closed.
*/ 
function OpenModalMenuItem({ modalComponent, itemText, onItemClick, onModalClose }) {
    const { setModalContent, setOnModalClose } = useModal();
    
    // Initiate the modal's opening.
    const onClick = () => {
      if (onModalClose) setOnModalClose(() => onModalClose);
      setModalContent(modalComponent);
      if (typeof onItemClick === 'function') onItemClick();
    }
    
    return <li 
        className='dropdown-btn' 
        onClick={onClick}
    >{itemText}</li>
  }

/** Component Props:
 *  @param user (Object) - The User to parse info from. 
 */
export default function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ulRef = useRef();
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Hide the profile dropdown. One-way method used for the modal.
    const closeDropdown = () => setShowDropdown(false);
    // Show the profile dropdown if hidden, and vice versa.
    const toggleDropdown = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    }

    // Execute a User logout. Logins & signups are handled in their respective modals.
    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeDropdown();
        navigate('/');
    }
    
    // If a click event occurs outside of the dropdown, close the dropdown.
    useEffect(() => {
        if(!showDropdown) return;
        const closeDropdown = (e) => { 
            if(ulRef.current && !ulRef.current.contains(e.target)) setShowDropdown(false);
        }
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, [showDropdown]);

    // Create a dynamic className for the visibility of the dropdown.
    const ulClassName = 'site-profile__dropdown' + (showDropdown ? '' : ' hidden');

    return (<div id='site-profile'>
        {/* Profile Buttons - they both do the same thing, pretty much only both exist for the wireframe */}
        <div id='site-profile__btn-container'>
            <button className='profile-btn' onClick={toggleDropdown}><MdDehaze /></button>
            <button className='profile-btn' onClick={toggleDropdown}><MdAccountCircle /></button>
        </div>

        {/* Profile Dropdown - displays different options depending on whether or not a User is logged in (user is not null) */}
        <ul className={ulClassName} ref={ulRef}>
            {user ? (<>
                {/* Section 1: User firstName and Email */}
                <li>Hello, {user.firstName}</li>
                <li id='dropdown-email'>{user.email}</li>

                {/* Section 2: Manage Spots Button */}
                <li id='dropdown-manage-spots'>
                    <NavLink to='/spots/current'>Manage Spots</NavLink>
                </li>

                {/* Section 3: Log Out Button */}
                <li>
                    <button id='dropdown-logout' onClick={logout}>Log Out</button>
                </li>
            </>) : (<>
                {/* Log In & Sign Up Modal Options - see OpenModalMenuItem for more details */}
                <OpenModalMenuItem 
                    modalComponent={<LoginFormModal />}
                    itemText='Log In' 
                    onItemClick={closeDropdown}  
                />
                <OpenModalMenuItem 
                    modalComponent={<SignupFormModal />} 
                    itemText='Sign Up' 
                    onItemClick={closeDropdown}  
                />
            </>)}
        </ul>
    </div>)
}