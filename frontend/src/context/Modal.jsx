/** src/context/Modal.jsx - Context Component
 ** Creates and exports the Modal context for Component use.
*/
import { createContext, useContext, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
    const modalRef = useRef();
    const [modalContent, setModalContent] = useState(null);
    const [onModalClose, setOnModalClose] = useState(null);

    const closeModal = () => {
        setModalContent(null);
        if(typeof onModalClose === 'function') {
            setOnModalClose(null);
            onModalClose();
        }
    }

    /** 
     *! sonarlint(javascript:S6481): 
    The 'contextValue' object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. */
    const contextValue = { modalRef, modalContent, setModalContent, setOnModalClose, closeModal }

    return (<>
        <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>
        <div ref={modalRef} />
    </>);
}

export function Modal() {
    const { modalRef, modalContent, closeModal } = useContext(ModalContext);
    if (!modalRef?.current || !modalContent) return null;
  
    // Render the following component to the div referenced by the modalRef
    return ReactDOM.createPortal(
        <div id='modal'>
            <button id='modal-background' onClick={closeModal} />
            <div id='modal-content'>{modalContent}</div>
        </div>,
        modalRef.current
    );
}