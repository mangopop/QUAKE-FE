import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStory } from "../services/stories.service";
import type { Story } from "../services/types";

export default function StoryDetails() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading } = useStory(storyId || "");

  if (isLoading) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (!story) {
    return <div className="p-4">Story not found</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Story Details</h2>
          <div className="flex gap-2">
            <Link
              to={`/stories/${story.id}/edit`}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Edit Story
            </Link>
            <Link
              to={`/stories/${story.id}/add-test`}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Add Test
            </Link>
            <Link
              to={`/stories/${story.id}/run`}
              className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
            >
              Run Story
            </Link>
            <button
              onClick={() => navigate('/stories')}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Back to Stories
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Story Name</h3>
              <p className="mt-1 text-gray-700">{story.name}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Created By</h3>
              <p className="mt-1 text-gray-700">
                {story.owner.firstName} {story.owner.lastName}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Templates</h3>
              <div className="mt-2 space-y-2">
                {story.templates.length === 0 ? (
                  <p className="text-gray-500">No templates associated with this story</p>
                ) : (
                  <ul className="list-disc list-inside">
                    {story.templates.map((template, index) => (
                      <li key={index} className="text-gray-700">
                        {template.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}