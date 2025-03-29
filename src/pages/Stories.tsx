import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StoryFolderTree from "../components/StoryFolderTree";
import { Story, StoryFolder, Test } from "../types/story";

export default function Stories() {
  const [rootFolder, setRootFolder] = useState<StoryFolder>({
    id: "root",
    name: "All Stories",
    createdAt: new Date().toISOString(),
    parentId: null,
    stories: [],
    subfolders: []
  });
  const [showNewStoryForm, setShowNewStoryForm] = useState(false);
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<StoryFolder | null>(null);
  const [newStory, setNewStory] = useState<Partial<Story>>({
    title: "",
    description: "",
    tests: []
  });
  const [newFolder, setNewFolder] = useState<Partial<StoryFolder>>({
    name: ""
  });

  // Load stories from localStorage on component mount
  useEffect(() => {
    try {
      const savedStories = localStorage.getItem('stories');
      if (savedStories) {
        const parsedData = JSON.parse(savedStories);
        // Validate the parsed data has the required structure
        if (parsedData && parsedData.id && parsedData.name) {
          setRootFolder(parsedData);
        } else {
          throw new Error('Invalid story data structure');
        }
      } else {
        // Initialize with default structure
        const defaultRootFolder: StoryFolder = {
          id: "root",
          name: "All Stories",
          createdAt: new Date().toISOString(),
          parentId: null,
          stories: [],
          subfolders: [
            {
              id: "1",
              name: "User Flows",
              createdAt: new Date().toISOString(),
              parentId: "root",
              stories: [
                {
                  id: "1",
                  title: "User Registration Flow",
                  description: "Complete user registration process including email verification and profile setup",
                  tests: [
                    {
                      id: "1",
                      title: "Email Registration",
                      template: "Login Flow",
                      templateId: "login-flow",
                      sections: [
                        {
                          name: "Email Input",
                          description: "Enter valid email address",
                          status: "passed",
                          notes: ""
                        }
                      ],
                      status: 'passed'
                    },
                    {
                      id: "2",
                      title: "Profile Setup",
                      template: "User Profile",
                      templateId: "user-profile",
                      sections: [
                        {
                          name: "Profile Form",
                          description: "Fill out profile information",
                          status: "not_tested",
                          notes: ""
                        }
                      ],
                      status: 'not_tested'
                    }
                  ],
                  createdAt: "2024-03-20T10:00:00Z"
                }
              ],
              subfolders: []
            },
            {
              id: "2",
              name: "E-commerce",
              createdAt: new Date().toISOString(),
              parentId: "root",
              stories: [
                {
                  id: "2",
                  title: "E-commerce Purchase Flow",
                  description: "Complete purchase process from product selection to order confirmation",
                  tests: [
                    {
                      id: "3",
                      title: "Product Selection",
                      template: "Product Search",
                      templateId: "product-search",
                      sections: [
                        {
                          name: "Search Products",
                          description: "Search for products",
                          status: "passed",
                          notes: ""
                        }
                      ],
                      status: 'passed'
                    },
                    {
                      id: "4",
                      title: "Checkout Process",
                      template: "Checkout Process",
                      templateId: "checkout-process",
                      sections: [
                        {
                          name: "Payment",
                          description: "Complete payment process",
                          status: "not_tested",
                          notes: ""
                        }
                      ],
                      status: 'not_tested'
                    }
                  ],
                  createdAt: "2024-03-19T15:30:00Z"
                }
              ],
              subfolders: []
            }
          ]
        };
        setRootFolder(defaultRootFolder);
        localStorage.setItem('stories', JSON.stringify(defaultRootFolder));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      // Initialize with empty root folder if there's an error
      const emptyRootFolder: StoryFolder = {
        id: "root",
        name: "All Stories",
        createdAt: new Date().toISOString(),
        parentId: null,
        stories: [],
        subfolders: []
      };
      setRootFolder(emptyRootFolder);
      localStorage.setItem('stories', JSON.stringify(emptyRootFolder));
    }
  }, []);

  const handleSubmitStory = () => {
    if (!newStory.title || !newStory.description) return;

    const story: Story = {
      id: Date.now().toString(),
      title: newStory.title,
      description: newStory.description,
      tests: newStory.tests || [],
      createdAt: new Date().toISOString()
    };

    console.log('Creating story:', story);
    console.log('Selected folder:', selectedFolder);

    const targetFolderId = selectedFolder?.id || "root";
    console.log('Target folder ID:', targetFolderId);

    const updatedRootFolder = addStoryToFolder(rootFolder, targetFolderId, story);
    console.log('Updated root folder:', updatedRootFolder);

    setRootFolder(updatedRootFolder);
    localStorage.setItem('stories', JSON.stringify(updatedRootFolder));
    resetStoryForm();
  };

  const handleSubmitFolder = () => {
    if (!newFolder.name) return;

    const folder: StoryFolder = {
      id: Date.now().toString(),
      name: newFolder.name,
      createdAt: new Date().toISOString(),
      parentId: selectedFolder?.id || "root",
      stories: [],
      subfolders: []
    };

    console.log('Creating folder:', folder);
    console.log('Selected folder:', selectedFolder);

    const targetFolderId = selectedFolder?.id || "root";
    console.log('Target folder ID:', targetFolderId);

    const updatedRootFolder = addFolderToFolder(rootFolder, targetFolderId, folder);
    console.log('Updated root folder:', updatedRootFolder);

    setRootFolder(updatedRootFolder);
    localStorage.setItem('stories', JSON.stringify(updatedRootFolder));
    resetFolderForm();
  };

  const resetStoryForm = () => {
    setNewStory({ title: "", description: "", tests: [] });
    setShowNewStoryForm(false);
  };

  const resetFolderForm = () => {
    setNewFolder({ name: "" });
    setShowNewFolderForm(false);
  };

  const addStoryToFolder = (folder: StoryFolder, targetFolderId: string, story: Story): StoryFolder => {
    if (folder.id === targetFolderId) {
      return {
        ...folder,
        stories: [...folder.stories, story]
      };
    }

    return {
      ...folder,
      subfolders: folder.subfolders.map(subfolder =>
        addStoryToFolder(subfolder, targetFolderId, story)
      )
    };
  };

  const addFolderToFolder = (folder: StoryFolder, targetFolderId: string, newFolder: StoryFolder): StoryFolder => {
    if (folder.id === targetFolderId) {
      return {
        ...folder,
        subfolders: [...folder.subfolders, newFolder]
      };
    }

    return {
      ...folder,
      subfolders: folder.subfolders.map(subfolder =>
        addFolderToFolder(subfolder, targetFolderId, newFolder)
      )
    };
  };

  const handleSelectStory = (story: Story) => {
    // Handle story selection - you can implement navigation or display details
    console.log('Selected story:', story);
  };

  const handleSelectFolder = (folder: StoryFolder) => {
    console.log('Selecting folder:', folder);
    // If clicking the same folder that's already selected, deselect it
    if (selectedFolder?.id === folder.id) {
      setSelectedFolder(null);
    } else {
      setSelectedFolder(folder);
    }
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: Test['status']) => {
    switch (status) {
      case 'passed':
        return '✓';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  const getStoryStatus = (story: Story): Test['status'] => {
    if (story.tests.length === 0) return 'not_tested';
    if (story.tests.some(test => test.status === 'failed')) return 'failed';
    if (story.tests.every(test => test.status === 'passed')) return 'passed';
    return 'not_tested';
  };

  const removeTestFromStory = (storyId: string, testId: string) => {
    const updatedRootFolder = {
      ...rootFolder,
      stories: rootFolder.stories.map(story =>
        story.id === storyId
          ? { ...story, tests: story.tests.filter(test => test.id !== testId) }
          : story
      ),
      subfolders: rootFolder.subfolders.map(subfolder => ({
        ...subfolder,
        stories: subfolder.stories.map(story =>
          story.id === storyId
            ? { ...story, tests: story.tests.filter(test => test.id !== testId) }
            : story
        )
      }))
    };
    setRootFolder(updatedRootFolder);
    localStorage.setItem('stories', JSON.stringify(updatedRootFolder));
  };

  // Function to recursively gather all stories from a folder and its subfolders
  const getAllStoriesFromFolder = (folder: StoryFolder): Story[] => {
    return [
      ...folder.stories,
      ...folder.subfolders.flatMap(subfolder => getAllStoriesFromFolder(subfolder))
    ];
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Folders</h2>
          <button
            onClick={() => setShowNewFolderForm(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            New Folder
          </button>
        </div>
        <StoryFolderTree
          folder={rootFolder}
          onSelectStory={handleSelectStory}
          onSelectFolder={handleSelectFolder}
          selectedFolderId={selectedFolder?.id}
        />
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {selectedFolder ? `Stories in ${selectedFolder.name}` : 'All Stories'}
          </h2>
          <button
            onClick={() => setShowNewStoryForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Story
          </button>
        </div>

        {showNewStoryForm && (
          <div className="mb-8 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-4">New Test Story</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Story Title</label>
                <input
                  type="text"
                  value={newStory.title}
                  onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  placeholder="Enter story title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newStory.description}
                  onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  placeholder="Enter story description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={resetStoryForm}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitStory}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Story
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewFolderForm && (
          <div className="mb-8 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-4">New Folder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Folder Name</label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  placeholder="Enter folder name"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={resetFolderForm}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFolder}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display stories from selected folder or all stories from root folder */}
        <div className="space-y-4">
          {selectedFolder ? (
            // Show stories from selected folder
            selectedFolder.stories.map((story) => (
              <div
                key={story.id}
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{story.title}</h3>
                      <span className={`${getStatusColor(getStoryStatus(story))}`}>
                        {getStatusIcon(getStoryStatus(story))}
                      </span>
                    </div>
                    <p className="text-gray-600">{story.description}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/stories/${story.id}/run`}
                      className="text-green-500 hover:text-green-700"
                    >
                      Run Story
                    </Link>
                    <Link
                      to={`/stories/${story.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this story?')) {
                          const updatedRootFolder = {
                            ...rootFolder,
                            stories: rootFolder.stories.filter(s => s.id !== story.id),
                            subfolders: rootFolder.subfolders.map(subfolder => ({
                              ...subfolder,
                              stories: subfolder.stories.filter(s => s.id !== story.id)
                            }))
                          };
                          setRootFolder(updatedRootFolder);
                          localStorage.setItem('stories', JSON.stringify(updatedRootFolder));
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Tests in this Story</h4>
                    <Link
                      to={`/stories/${story.id}/add-test`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      + Add Test
                    </Link>
                  </div>
                  {story.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between border-t pt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{test.title}</span>
                        <span className="text-sm text-gray-500">({test.template})</span>
                        <span className={`${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/stories/${story.id}/run?testIndex=${story.tests.findIndex(t => t.id === test.id)}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Run Test
                        </Link>
                        <button
                          onClick={() => removeTestFromStory(story.id, test.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show folders and their stories when viewing "All Stories"
            <>
              {rootFolder.subfolders.map((folder) => (
                <div key={folder.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-700">{folder.name}</h3>
                    <span className="text-sm text-gray-500">
                      ({folder.stories.length} stories)
                    </span>
                  </div>
                  {folder.stories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow ml-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{story.title}</h3>
                            <span className={`${getStatusColor(getStoryStatus(story))}`}>
                              {getStatusIcon(getStoryStatus(story))}
                            </span>
                          </div>
                          <p className="text-gray-600">{story.description}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(story.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/stories/${story.id}/run`}
                            className="text-green-500 hover:text-green-700"
                          >
                            Run Story
                          </Link>
                          <Link
                            to={`/stories/${story.id}/edit`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this story?')) {
                                const updatedRootFolder = {
                                  ...rootFolder,
                                  stories: rootFolder.stories.filter(s => s.id !== story.id),
                                  subfolders: rootFolder.subfolders.map(subfolder => ({
                                    ...subfolder,
                                    stories: subfolder.stories.filter(s => s.id !== story.id)
                                  }))
                                };
                                setRootFolder(updatedRootFolder);
                                localStorage.setItem('stories', JSON.stringify(updatedRootFolder));
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Tests in this Story</h4>
                          <Link
                            to={`/stories/${story.id}/add-test`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            + Add Test
                          </Link>
                        </div>
                        {story.tests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between border-t pt-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{test.title}</span>
                              <span className="text-sm text-gray-500">({test.template})</span>
                              <span className={`${getStatusColor(test.status)}`}>
                                {getStatusIcon(test.status)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/stories/${story.id}/run?testIndex=${story.tests.findIndex(t => t.id === test.id)}`}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Run Test
                              </Link>
                              <button
                                onClick={() => removeTestFromStory(story.id, test.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {rootFolder.stories.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-700">Root Stories</h3>
                    <span className="text-sm text-gray-500">
                      ({rootFolder.stories.length} stories)
                    </span>
                  </div>
                  {rootFolder.stories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{story.title}</h3>
                            <span className={`${getStatusColor(getStoryStatus(story))}`}>
                              {getStatusIcon(getStoryStatus(story))}
                            </span>
                          </div>
                          <p className="text-gray-600">{story.description}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(story.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/stories/${story.id}/run`}
                            className="text-green-500 hover:text-green-700"
                          >
                            Run Story
                          </Link>
                          <Link
                            to={`/stories/${story.id}/edit`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this story?')) {
                                const updatedRootFolder = {
                                  ...rootFolder,
                                  stories: rootFolder.stories.filter(s => s.id !== story.id),
                                  subfolders: rootFolder.subfolders.map(subfolder => ({
                                    ...subfolder,
                                    stories: subfolder.stories.filter(s => s.id !== story.id)
                                  }))
                                };
                                setRootFolder(updatedRootFolder);
                                localStorage.setItem('stories', JSON.stringify(updatedRootFolder));
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Tests in this Story</h4>
                          <Link
                            to={`/stories/${story.id}/add-test`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            + Add Test
                          </Link>
                        </div>
                        {story.tests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between border-t pt-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{test.title}</span>
                              <span className="text-sm text-gray-500">({test.template})</span>
                              <span className={`${getStatusColor(test.status)}`}>
                                {getStatusIcon(test.status)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/stories/${story.id}/run?testIndex=${story.tests.findIndex(t => t.id === test.id)}`}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Run Test
                              </Link>
                              <button
                                onClick={() => removeTestFromStory(story.id, test.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}