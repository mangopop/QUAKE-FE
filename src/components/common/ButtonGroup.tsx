import React from 'react';
import Button from './Button';

interface ButtonGroupProps {
  onCancel: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isSubmitDisabled?: boolean;
  className?: string;
}

export default function ButtonGroup({
  onCancel,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitDisabled = false,
  className = ''
}: ButtonGroupProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      <Button
        type="submit"
        disabled={isSubmitDisabled}
      >
        {submitText}
      </Button>
      <Button
        onClick={onCancel}
        variant="secondary"
      >
        {cancelText}
      </Button>
    </div>
  );
}