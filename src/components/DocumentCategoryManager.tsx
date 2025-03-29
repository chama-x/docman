import { useState, FormEvent } from 'react';
import { DocumentCategories } from '../types/documentTypes';
import { addDocumentType, editDocumentType, deleteDocumentType } from '../services/documentService';

interface DocumentCategoryManagerProps {
  documentTypes: DocumentCategories;
  onUpdate: () => void;
}

export default function DocumentCategoryManager({ documentTypes, onUpdate }: DocumentCategoryManagerProps) {
  const [newTypeName, setNewTypeName] = useState<string>('');
  const [isTeacherType, setIsTeacherType] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editKey, setEditKey] = useState<string>('');
  const [editCategory, setEditCategory] = useState<'common' | 'teacher'>('common');
  
  const resetForm = () => {
    setNewTypeName('');
    setIsTeacherType(false);
    setEditMode(false);
    setEditKey('');
    setEditCategory('common');
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newTypeName.trim()) {
      return setError('Document type name is required');
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (editMode) {
        await editDocumentType(editKey, newTypeName, editCategory);
        setSuccess(`Document type "${newTypeName}" updated successfully`);
      } else {
        await addDocumentType(newTypeName, isTeacherType);
        setSuccess(`Document type "${newTypeName}" added successfully`);
      }
      
      resetForm();
      onUpdate();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (key: string, name: string, category: 'common' | 'teacher') => {
    setEditMode(true);
    setEditKey(key);
    setNewTypeName(name);
    setEditCategory(category);
    setIsTeacherType(category === 'teacher');
  };
  
  const handleDelete = async (key: string, category: 'common' | 'teacher') => {
    if (!window.confirm('Are you sure you want to delete this document type?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await deleteDocumentType(category, key);
      setSuccess('Document type deleted successfully');
      onUpdate();
    } catch (error) {
      setError('Failed to delete document type');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">
        {editMode ? 'Edit Document Type' : 'Add New Document Type'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="typeName">
            Document Type Name
          </label>
          <input
            type="text"
            id="typeName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Enter document type name"
            required
          />
        </div>
        
        {!editMode && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTeacherType"
                className="mr-2"
                checked={isTeacherType}
                onChange={(e) => setIsTeacherType(e.target.checked)}
              />
              <label htmlFor="isTeacherType">Teacher-specific document type</label>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Processing...' : editMode ? 'Update' : 'Add'}
          </button>
          
          {editMode && (
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Common Document Types</h3>
        <table className="min-w-full bg-white mb-6">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Key</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(documentTypes.common).length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">No common document types found</td>
              </tr>
            ) : (
              Object.entries(documentTypes.common).map(([key, name]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{name}</td>
                  <td className="py-2 px-4 border-b">{key}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(key, name, 'common')}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(key, 'common')}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <h3 className="text-lg font-semibold mb-4">Teacher Document Types</h3>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Key</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(documentTypes.teacher).length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">No teacher document types found</td>
              </tr>
            ) : (
              Object.entries(documentTypes.teacher).map(([key, name]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{name}</td>
                  <td className="py-2 px-4 border-b">{key}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(key, name, 'teacher')}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(key, 'teacher')}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 