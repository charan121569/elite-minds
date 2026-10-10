import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LANGUAGES = [
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'Go', label: 'Go' },
  { value: 'C#', label: 'C# / .NET' },
];

const FRAMEWORKS = [
  { value: 'React', label: 'React (Vite)' },
  { value: 'FastAPI', label: 'FastAPI (Python)' },
  { value: 'Spring Boot', label: 'Spring Boot (Java)' },
  { value: 'Next.js', label: 'Next.js (React Full-stack)' },
  { value: 'Node/Express', label: 'Express.js (Node)' },
  { value: 'Django', label: 'Django REST Framework' },
];

const DATABASES = [
  { value: 'MySQL', label: 'MySQL 8.x' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'SQLite', label: 'SQLite (Local)' },
  { value: 'MongoDB', label: 'MongoDB' },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { refreshProjects, setActiveProject } = useProject();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [framework, setFramework] = useState('React');
  const [database, setDatabase] = useState('MySQL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await api.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        programming_language: language,
        framework,
        database_preference: database,
        status: 'active',
      });
      await refreshProjects();
      setActiveProject(created);
      success('Project Created', `Project "${created.name}" is now your active workspace.`);
      setName('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      error('Failed to Create Project', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Define the name, description, and target architecture stack."
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. Student Management System"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Textarea
          label="Description"
          placeholder="Describe the scope, business goals, and core features of this system..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Language"
            options={LANGUAGES}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
          <Select
            label="Framework"
            options={FRAMEWORKS}
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
          />
          <Select
            label="Database"
            options={DATABASES}
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
