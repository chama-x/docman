import React from "react";

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
}) => {
  return (
    <div data-oid="rabwj5e">
      <label
        className="block text-primary text-sm font-medium mb-2"
        htmlFor={id}
        data-oid="k_efj-8"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        className="w-full px-3 py-2 rounded-md transition-all focus:ring-2 focus:ring-primary focus:outline-none"
        style={{
          border: "1px solid #e2e8f0",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          color: "#333333"
        }}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        data-oid="9.oot-z"
      />
    </div>
  );
};

export default InputField;
