import { List } from "@raycast/api";
import React, { useEffect, useMemo, useState } from "react";
import { getTasksByProjectId } from "./service/osScript";
import { getTaskCopyContent, getTaskDetailMarkdownContent, Section } from "./service/task";
import useStartApp from "./hooks/useStartApp";
import TaskItem from "./components/taskItem";
import useSearchTasks from "./hooks/useSearchTasks";
import { getProjects } from "./service/project";

const TickTickInbox: React.FC<Record<string, never>> = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sections, setSections] = useState<Section[] | null>(null);
  const { isInitCompleted } = useStartApp();

  useEffect(() => {
    const getTasks = async () => {
      const inbox = getProjects().find((project) => project.name === "Inbox");
      if (inbox) {
        const sections = await getTasksByProjectId(inbox.id);
        setSections(sections);
      }
    };

    if (isInitCompleted) {
      getTasks();
    }
  }, [isInitCompleted]);

  const { searchTasks, isSearching } = useSearchTasks({ searchQuery, isInitCompleted });

  const isLoading = useMemo(() => {
    if (!isInitCompleted) {
      return true;
    }

    if (searchQuery) {
      return isSearching;
    }
    return sections == null;
  }, [isInitCompleted, searchQuery, isSearching, sections]);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchQuery}
      searchBarPlaceholder="Search all tasks..."
      isShowingDetail
    >
      {searchTasks
        ? searchTasks.map((task) => (
            <TaskItem
              key={task.id}
              actionType="project"
              id={task.id}
              title={task.title}
              projectId={task.projectId}
              priority={task.priority}
              detailMarkdown={getTaskDetailMarkdownContent(task)}
              tags={task.tags}
              copyContent={getTaskCopyContent(task)}
            />
          ))
        : sections?.map((section) => {
            return (
              <List.Section key={section.id} title={`${section.name}`} subtitle={`${section.children.length}`}>
                {section.children.map((task) => (
                  <TaskItem
                    key={task.id}
                    actionType="project"
                    id={task.id}
                    title={task.title}
                    projectId={task.projectId}
                    priority={task.priority}
                    tags={task.tags}
                    detailMarkdown={getTaskDetailMarkdownContent(task)}
                    copyContent={getTaskCopyContent(task)}
                  />
                ))}
              </List.Section>
            );
          })}
    </List>
  );
};

export default TickTickInbox;
