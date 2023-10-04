import React, {useState, useRef, useEffect } from "react";
import styles from "./Modal.module.css"

import Close from "../../../assets/uta-close.svg";


interface ModalProps {
    isOpen: boolean;
    hasCloseBtn?: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    title: string | undefined;
    confirmText?: string;
    confirmationModal?: boolean;
    hasCancelBtn?: boolean;

  };

 export const Modal: React.FC<ModalProps> = ({ 
    isOpen,
    hasCloseBtn = true, 
    onClose, 
    children, 
    title = '',
    confirmText = 'Ok',
    confirmationModal = false,
    hasCancelBtn = true 
  }) => {
    const [isModalOpen, setModalOpen] = useState(isOpen);
    const modalRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        setModalOpen(isOpen);
    }, [isOpen]);
    
    useEffect(() => {
    const modalElement = modalRef.current;
    console.info('we in here')
    if (modalElement) {
        if (isModalOpen) {
        modalElement.showModal();
        } else {
        modalElement.close();
        }
    }
    }, [isModalOpen]);  

    const handleCloseModal = () => {
        if (onClose) {
          onClose();
        }
        setModalOpen(false);
      };

      const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
        if (event.key === "Escape") {
          handleCloseModal();
        }
      };
  console.info('title', title)
  console.info('children', children)
    return (
      <dialog ref={modalRef} className={styles.modal}>
        <div className={styles.heading}>
          <h3>{title}</h3>
          {hasCloseBtn && (
            <div className={styles.closeIcon}
              onClick={handleCloseModal}
              >
            <img
                src={Close}
                // className={styles.chatIcon}
                aria-hidden="true"
            />
          </div>
          )}
        </div>
        <div className={styles.content}> {children}</div>
        {confirmationModal && (
          <div className={styles.footer}>
            {confirmationModal && (
              <button className={styles.cancelBtn} >Cancel</button>
            )}
            <button className={styles.confirmBtn} >{confirmText}</button>
          </div>
        )}       
      </dialog>
    );
  };
  