import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { StoryFolder, Story } from '../types/story';

interface StoryFolderTreeProps {
  folder: StoryFolder;
  level?: number;
  onSelectStory: (story: Story) => void;
  onSelectFolder: (folder: StoryFolder) => void;
  selectedFolderId?: string | null;
}

export default function StoryFolderTree({
  folder,
  level = 0,
  onSelectStory,
  onSelectFolder,
  selectedFolderId,
}: StoryFolderTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = `${level * 1.5}rem`;

  if (!folder) {
    return null;
  }

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    onSelectFolder(folder);
  };

  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft }}
        onClick={handleFolderClick}
      >
        {folder.subfolders?.length > 0 && (
          isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />
        )}
        <Folder className="w-4 h-4 mr-2 text-blue-500" />
        <span className="text-sm">{folder.name}</span>
      </div>

      {isExpanded && (
        <>
          {folder.stories?.map((story) => (
            <div
              key={story.id}
              className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer"
              style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
              onClick={() => onSelectStory(story)}
            >
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">{story.title}</span>
            </div>
          ))}
          {folder.subfolders?.map((subfolder) => (
            <StoryFolderTree
              key={subfolder.id}
              folder={subfolder}
              level={level + 1}
              onSelectStory={onSelectStory}
              onSelectFolder={onSelectFolder}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </>
      )}
    </div>
  );
}