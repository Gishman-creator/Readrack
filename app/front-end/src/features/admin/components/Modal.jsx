// Modal.js
import React from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed z-30 left-0 right-0 top-0 bottom-0 min-h-screen min-w-full bg-black bg-opacity-50 flex justify-center items-center "
      onClick={onClose}
    >
      <div
        className="p-4 rounded-lg max-w-[90%] sm:max-w-[70%] md:max-w-fit min-h-custom1 md:max-h-custom2 overflow-hidden"
      >
        <div
          className="bg-white md:mt-[10vh] md:w-fit py-4 px-8 rounded-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="close absolute top-1 right-3 text-2xl cursor-pointer"
            onClick={onClose}
          >
            &times;
          </span>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('portal')
  );
}

export default Modal;
