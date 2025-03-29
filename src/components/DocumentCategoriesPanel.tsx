import { useState, useEffect } from 'react';
import { ref, get, set, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { DocumentCategories } from '../types/documentTypes';
import { useAuth } from '../contexts/AuthContext';

export default function DocumentCategoriesPanel() {
  const [loading, setLoading] = useState<boolean>(true);
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {}
  });
  const [newCategoryType, setNewCategoryType] = useState<'common' | 'teacher'>('common');
  const [newCategoryKey, setNewCategoryKey] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<{
    type: 'common' | 'teacher',
    key: string,
    name: string
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { currentUser } = useAuth();
  
  // Determine if user is principal or document manager
  const isDocManager = currentUser?.email?.toLowerCase() === 'docmanager@school.edu';
  const isPrincipal = currentUser?.email?.toLowerCase() === 'principal@school.edu';
  
  // Set theme colors based on user role
  const themeColor = isPrincipal ? 'blue' : 'purple';

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      const docTypesRef = ref(database, 'documentTypes');
      const snapshot = await get(docTypesRef);
      
      if (snapshot.exists()) {
        setDocumentTypes(snapshot.val());
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
      setError('Failed to load document categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryKey || !newCategoryName) {
      setError('Both key and name are required');
      return;
    }
    
    // Convert key to snake_case format
    const formattedKey = newCategoryKey.toLowerCase().replace(/\s+/g, '_');
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Check if the key already exists
      if (documentTypes[newCategoryType][formattedKey]) {
        setError(`A category with key "${formattedKey}" already exists`);
        return;
      }
      
      // Add the new category
      const newDocTypes = { ...documentTypes };
      newDocTypes[newCategoryType][formattedKey] = newCategoryName;
      
      // Update in Firebase
      await set(ref(database, 'documentTypes'), newDocTypes);
      
      // Update state
      setDocumentTypes(newDocTypes);
      setNewCategoryKey('');
      setNewCategoryName('');
      setSuccess(`Category "${newCategoryName}" added successfully`);
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (type: 'common' | 'teacher', key: string, name: string) => {
    setEditingCategory({ type, key, name });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Update the category
      const newDocTypes = { ...documentTypes };
      newDocTypes[editingCategory.type][editingCategory.key] = editingCategory.name;
      
      // Update in Firebase
      await update(ref(database, `documentTypes/${editingCategory.type}`), { 
        [editingCategory.key]: editingCategory.name 
      });
      
      // Update state
      setDocumentTypes(newDocTypes);
      setEditingCategory(null);
      setSuccess('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (type: 'common' | 'teacher', key: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this category? Any documents of this type will lose their category.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Delete the category
      const newDocTypes = { ...documentTypes };
      delete newDocTypes[type][key];
      
      // Update in Firebase
      await remove(ref(database, `documentTypes/${type}/${key}`));
      
      // Update state
      setDocumentTypes(newDocTypes);
      setSuccess('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Document Categories</h2>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 bg-opacity-20 border border-green-700 text-green-400 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {loading && !documentTypes ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Current Categories</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Common Categories */}
            <div>
              <h4 className={`font-semibold text-${themeColor}-400 mb-2`}>Common Categories</h4>
              <p className="text-sm text-gray-400 mb-3">
                These categories are available to all users
              </p>
              
              <div className="bg-gray-800 rounded shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Display Name
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {Object.entries(documentTypes.common).map(([key, name]) => (
                      <tr key={key} className="hover:bg-gray-700">
                        <td className="py-2 px-4 text-sm font-mono text-gray-300">{key}</td>
                        <td className="py-2 px-4 text-sm">
                          {editingCategory && editingCategory.type === 'common' && editingCategory.key === key ? (
                            <input
                              type="text"
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full text-white"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                name: e.target.value
                              })}
                            />
                          ) : (
                            name
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {editingCategory && editingCategory.type === 'common' && editingCategory.key === key ? (
                            <div className="flex space-x-2">
                              <button
                                className={`bg-green-900 text-green-300 hover:bg-green-800 rounded px-2 py-1`}
                                onClick={handleUpdateCategory}
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 rounded px-2 py-1"
                                onClick={() => setEditingCategory(null)}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                className={`bg-${themeColor}-900 text-${themeColor}-300 hover:bg-${themeColor}-800 rounded px-2 py-1`}
                                onClick={() => handleEditCategory('common', key, name)}
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-red-900 text-red-300 hover:bg-red-800 rounded px-2 py-1"
                                onClick={() => handleDeleteCategory('common', key)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(documentTypes.common).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">
                          No common categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Teacher Categories */}
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Teacher Categories</h4>
              <p className="text-sm text-gray-400 mb-3">
                These categories are only available to teachers
              </p>
              
              <div className="bg-gray-800 rounded shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Display Name
                      </th>
                      <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {Object.entries(documentTypes.teacher).map(([key, name]) => (
                      <tr key={key} className="hover:bg-gray-700">
                        <td className="py-2 px-4 text-sm font-mono text-gray-300">{key}</td>
                        <td className="py-2 px-4 text-sm">
                          {editingCategory && editingCategory.type === 'teacher' && editingCategory.key === key ? (
                            <input
                              type="text"
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full text-white"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                name: e.target.value
                              })}
                            />
                          ) : (
                            name
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {editingCategory && editingCategory.type === 'teacher' && editingCategory.key === key ? (
                            <div className="flex space-x-2">
                              <button
                                className="bg-green-900 text-green-300 hover:bg-green-800 rounded px-2 py-1"
                                onClick={handleUpdateCategory}
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 rounded px-2 py-1"
                                onClick={() => setEditingCategory(null)}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                className={`bg-${themeColor}-900 text-${themeColor}-300 hover:bg-${themeColor}-800 rounded px-2 py-1`}
                                onClick={() => handleEditCategory('teacher', key, name)}
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-red-900 text-red-300 hover:bg-red-800 rounded px-2 py-1"
                                onClick={() => handleDeleteCategory('teacher', key)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(documentTypes.teacher).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">
                          No teacher categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Category Form */}
      <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Category Type
            </label>
            <select
              className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white focus:outline-none focus:ring focus:ring-blue-500"
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value as 'common' | 'teacher')}
              disabled={loading}
            >
              <option value="common">Common</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Category Key
            </label>
            <input
              type="text"
              className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="e.g. birth_certificate"
              value={newCategoryKey}
              onChange={(e) => setNewCategoryKey(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Use lowercase with underscores. This is used internally.
            </p>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Display Name
            </label>
            <input
              type="text"
              className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="e.g. Birth Certificate"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              This is what users will see when submitting documents.
            </p>
          </div>
          
          <div className="md:flex md:items-end">
            <button
              className={`bg-${themeColor}-700 hover:bg-${themeColor}-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-${themeColor}-500`}
              onClick={handleAddCategory}
              disabled={loading || !newCategoryKey || !newCategoryName}
            >
              {loading ? 'Processing...' : 'Add Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 