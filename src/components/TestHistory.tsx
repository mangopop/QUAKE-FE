import type { StoryHistoryResponse } from "../services/types";

interface TestHistoryProps {
  storyHistory: StoryHistoryResponse;
}

export default function TestHistory({ storyHistory }: TestHistoryProps) {
  if (!storyHistory.history.length) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Test History</h3>
      <div className="space-y-4">
        {storyHistory.history.map((entry, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
            <div
              className={`p-4 cursor-pointer flex justify-between items-center transition-colors duration-200 ${
                entry.status === "2" ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"
              }`}
              onClick={() => {
                const details = document.getElementById(`history-details-${index}`);
                const arrow = document.getElementById(`history-arrow-${index}`);
                if (details && arrow) {
                  details.classList.toggle('hidden');
                  arrow.classList.toggle('rotate-180');
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  entry.status === "2" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {entry.status === "2" ? "Passed" : "Failed"}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  <span className="text-gray-400">•</span>
                  <span>by {entry.created_by.firstName}</span>
                </div>
              </div>
              <svg
                id={`history-arrow-${index}`}
                className="w-5 h-5 text-gray-500 transition-transform duration-200"
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
              <div className="p-4 border-t bg-white">
                <div className="space-y-4">
                  {entry.tests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-900">{test.name}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          test.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {test.status === "passed" ? "Passed" : "Failed"}
                        </span>
                      </div>

                      {test.notes.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Test Notes</h4>
                          <div className="space-y-2">
                            {test.notes.map((note, noteIndex) => {
                              const match = note.match(/\[(.*?)\] (.*?): (.*)/);
                              if (match) {
                                const [, timestamp, user, content] = match;
                                return (
                                  <div key={noteIndex} className="text-sm bg-white rounded-lg p-3 border">
                                    <div className="flex items-center text-gray-500 mb-1">
                                      <span>{timestamp}</span>
                                      <span className="mx-2">•</span>
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
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Sections</h4>
                          <div className="space-y-3">
                            {test.sections.map((section) => (
                              <div key={section.id} className="bg-white rounded-lg p-3 border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-900">{section.name}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    section.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {section.status}
                                  </span>
                                </div>

                                {test.section_notes.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {test.section_notes
                                      .filter(note => note.includes(`[Section: ${section.name}]`))
                                      .map((note, noteIndex) => {
                                        const match = note.match(/\[Section: (.*?)\] \[(.*?)\] (.*?): (.*)/);
                                        if (match) {
                                          const [, , timestamp, user, content] = match;
                                          return (
                                            <div key={noteIndex} className="text-sm bg-gray-50 rounded-lg p-2 border">
                                              <div className="flex items-center text-gray-500 mb-1">
                                                <span>{timestamp}</span>
                                                <span className="mx-2">•</span>
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