// src/components/Checkbox.js

import React from "react";

const Checkbox = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-100 focus:bg-transparent checkbox-white"
        checked={checked}
        onChange={onChange}
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default Checkbox;
