import { useState } from "react";
import Modal from "./common/Modal";

interface FailureReason {
  testId: number;
  testName: string;
  sectionId?: number;
  sectionName?: string;
  reason: string;
}

interface FailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFail: (notes: string, reasons: FailureReason[]) => Promise<void>;
  tests: {
    id: number;
    name: string;
    sections: {
      id: number;
      name: string;
    }[];
  }[];
}

export default function FailedModal({ isOpen, onClose, onFail, tests }: FailedModalProps) {
  const [failureNotes, setFailureNotes] = useState("");
  const [failureReasons, setFailureReasons] = useState<FailureReason[]>([]);

  const handleFail = async () => {
    await onFail(failureNotes, failureReasons);
    setFailureNotes("");
    setFailureReasons([]);
  };

  const addFailureReason = () => {
    setFailureReasons([...failureReasons, { testId: 0, testName: "", reason: "" }]);
  };

  const removeFailureReason = (index: number) => {
    setFailureReasons(failureReasons.filter((_, i) => i !== index));
  };

  const updateFailureReason = (index: number, field: keyof FailureReason, value: any) => {
    const newReasons = [...failureReasons];
    newReasons[index] = { ...newReasons[index], [field]: value };
    setFailureReasons(newReasons);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Story as Failed">
      <div className="space-y-4">
        <p className="text-gray-600">
          Please provide details about why the story failed.
        </p>
        <textarea
          value={failureNotes}
          onChange={(e) => setFailureNotes(e.target.value)}
          placeholder="Add failure notes..."
          className="w-full p-2 border rounded mt-4"
          rows={4}
          data-testid="failure-notes"
        />

        <div>
          <div className="flex justify-between items-center mt-4">
            <h4 className="font-medium">Failure Reasons</h4>
            <button
              onClick={addFailureReason}
              className="text-blue-500 hover:text-blue-600 text-sm"
              data-testid="add-failure-reason"
            >
              + Add Reason
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {failureReasons.map((reason, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1 space-y-2">
                  <select
                    value={reason.testId}
                    onChange={(e) => updateFailureReason(index, "testId", parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                    data-testid="test-select"
                  >
                    <option value="">Select Test</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={reason.sectionId || ""}
                    onChange={(e) => updateFailureReason(index, "sectionId", e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full p-2 border rounded"
                    data-testid="section-select"
                  >
                    <option value="">Select Section (Optional)</option>
                    {tests
                      .find((test) => test.id === reason.testId)
                      ?.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    value={reason.reason}
                    onChange={(e) => updateFailureReason(index, "reason", e.target.value)}
                    placeholder="Failure reason..."
                    className="w-full p-2 border rounded"
                    data-testid="reason-input"
                  />
                </div>
                <button
                  onClick={() => removeFailureReason(index)}
                  className="text-red-500 hover:text-red-600 p-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFail}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
            data-testid="confirm-failure"
          >
            Mark as Failed
          </button>
        </div>
      </div>
    </Modal>
  );
}