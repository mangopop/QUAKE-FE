import type { StoryHistoryResponse } from "../services/types";

interface TestHistoryProps {
  storyHistory: StoryHistoryResponse;
}

export default function TestHistory({ storyHistory }: TestHistoryProps) {
  if (!storyHistory.history.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Test History</h3>
      <div className="space-y-2">
        {storyHistory.history.map((entry, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div
              className={`p-3 cursor-pointer flex justify-between items-center ${
                entry.status === "2" ? "bg-green-50" : "bg-red-50"
              }`}
              onClick={() => {
                const details = document.getElementById(`history-details-${index}`);
                if (details) {
                  details.classList.toggle('hidden');
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-sm ${
                  entry.status === "2" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {entry.status === "2" ? "Passed" : "Failed"}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">
                  by {entry.created_by.firstName}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <div id={`history-details-${index}`} className="hidden">
              <div className="p-3 border-t bg-white">
                <div className="space-y-3">
                  {entry.tests.map((test) => (
                    <div key={test.id} className="border rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{test.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          test.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {test.status === "passed" ? "Passed" : "Failed"}
                        </span>
                      </div>

                      {test.notes.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Test Notes</h4>
                          <div className="space-y-2">
                            {test.notes.map((note, noteIndex) => {
                              const match = note.match(/\[(.*?)\] (.*?): (.*)/);
                              if (match) {
                                const [, timestamp, user, content] = match;
                                return (
                                  <div key={noteIndex} className="text-xs bg-white rounded p-1.5 border">
                                    <div className="flex items-center text-gray-500 mb-0.5">
                                      <span>{timestamp}</span>
                                      <span className="mx-1">•</span>
                                      <span className="font-medium">{user}</span>
                                    </div>
                                    <div className="text-gray-700">{content}</div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}

                      {test.sections.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Sections</h4>
                          <div className="space-y-3">
                            {test.sections.map((section) => (
                              <div key={section.id} className="bg-gray-50 rounded p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{section.name}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    section.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {section.status}
                                  </span>
                                </div>

                                {test.section_notes.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {test.section_notes
                                      .filter(note => note.includes(`[Section: ${section.name}]`))
                                      .map((note, noteIndex) => {
                                        const match = note.match(/\[Section: (.*?)\] \[(.*?)\] (.*?): (.*)/);
                                        if (match) {
                                          const [, , timestamp, user, content] = match;
                                          return (
                                            <div key={noteIndex} className="text-xs bg-white rounded p-1.5 border">
                                              <div className="flex items-center text-gray-500 mb-0.5">
                                                <span>{timestamp}</span>
                                                <span className="mx-1">•</span>
                                                <span className="font-medium">{user}</span>
                                              </div>
                                              <div className="text-gray-700">{content}</div>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}