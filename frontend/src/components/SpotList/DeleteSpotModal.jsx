import { useModal } from '../../context/Modal';

export function OpenDeleteSpotModal({ modalComponent, buttonText, onButtonClick, onModalClose }) {
    const { setModalContent, setOnModalClose } = useModal();

    const onClick = () => {
        if (onModalClose) setOnModalClose(onModalClose);
        setModalContent(modalComponent);
        if (typeof onButtonClick === 'function') onButtonClick();
    }

    return <button onClick={onClick}>{buttonText}</button>
}

export default function DeleteSpotModal() {
    //const { closeModal } = useModal();

    return (<>
        <h1 className='modal-title'>Confirm Delete</h1>
    </>)
}