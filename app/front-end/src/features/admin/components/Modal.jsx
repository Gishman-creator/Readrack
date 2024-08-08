// Modal.js
import React from 'react';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
    className="fixed left-0 right-0 min-h-screen min-w-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={onClose}
    >
      <div
       className="p-4 rounded-lg max-w-[90%] sm:max-w-[70%] md:max-w-fit min-h-custom1 md:max-h-custom2 overflow-hidden"
       onClick={(e) => e.stopPropagation()}
       >
        <div className="bg-white md:mt-[10vh] md:w-fit py-4 px-8 rounded-lg relative">
        <span
          className="close absolute top-1 right-3 text-2xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </span>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
