import { useState } from "react";
import Modal from "./common/Modal";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (notes: string) => Promise<void>;
}

export default function CompletionModal({ isOpen, onClose, onComplete }: CompletionModalProps) {
  const [completionNotes, setCompletionNotes] = useState("");

  const handleComplete = async () => {
    await onComplete(completionNotes);
    setCompletionNotes("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Story">
      <div className="space-y-4">
        <p className="text-gray-600">
          All tests have passed. Please add any final notes before completing the story.
        </p>
        <textarea
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
          placeholder="Add completion notes..."
          className="w-full p-2 border rounded"
          rows={4}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setCompletionNotes("");
              onClose();
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Complete Story
          </button>
        </div>
      </div>
    </Modal>
  );
}