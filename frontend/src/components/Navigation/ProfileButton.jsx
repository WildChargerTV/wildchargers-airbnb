import { useState, useEffect, useRef } from 'react';
import { BsPersonFill } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import LoginFormModal from '../LoginFormModal';
import OpenModalMenuItem from './OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';
import * as sessionActions from '../../store/session';

const ProfileButton = ({ user }) => {
    const dispatch = useDispatch();
    const ulRef = useRef();
    const [showMenu, setShowMenu] = useState(false);
    
    const closeMenu = () => setShowMenu(false);
    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeMenu();
    }
    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    }

    useEffect(() => {
        if(!showMenu) return;
        const closeMenu = (e) => { 
            if(!ulRef.current.contains(e.target)) setShowMenu(false);
        }
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [showMenu]);

    const ulClassName = 'profile-dropdown' + (showMenu ? '' : ' hidden');
    return (<div id='site-profile-btn'>
        <button onClick={toggleMenu}><BsPersonFill /></button>
        <ul className={ulClassName} ref={ulRef}>
            {user ? (<>
                <li>{user.username}</li>
                <li>{user.firstName} {user.lastName}</li>
                <li>{user.email}</li>
                <li><button onClick={logout}>Log Out</button></li>
            </>) : (<>
                <OpenModalMenuItem itemText='Log In' onItemClick={closeMenu} modalComponent={<LoginFormModal />} />
                <OpenModalMenuItem itemText='Sign Up' onItemClick={closeMenu} modalComponent={<SignupFormModal />} />
            </>)}
        </ul>
    </div>)
}

export default ProfileButton;