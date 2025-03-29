import { useState, useEffect } from "react";
import { ref, get, set, update, remove } from "firebase/database";
import { database } from "../firebase";
import { DocumentCategories } from "../types/documentTypes";
import { useAuth } from "../contexts/AuthContext";

export default function DocumentCategoriesPanel() {
  const [loading, setLoading] = useState<boolean>(true);
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {},
  });
  const [newCategoryType, setNewCategoryType] = useState<"common" | "teacher">(
    "common",
  );
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<{
    type: "common" | "teacher";
    key: string;
    name: string;
    originalName: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { currentUser } = useAuth();

  // Determine if user is principal or document manager
  const isDocManager =
    currentUser?.email?.toLowerCase() === "docmanager@school.edu";
  const isPrincipal =
    currentUser?.email?.toLowerCase() === "principal@school.edu";

  // Set theme colors based on user role
  const themeColor = isPrincipal ? "blue" : "purple";

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      setError("");
      const docTypesRef = ref(database, "documentTypes");
      const snapshot = await get(docTypesRef);

      if (snapshot.exists()) {
        setDocumentTypes(snapshot.val());
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      setError("Failed to load document categories. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Generate a key from the category name
  const generateKeyFromName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "") // Remove any non-alphanumeric characters except spaces
      .replace(/\s+/g, "_"); // Replace spaces with underscores
  };

  // Check if a name already exists in a category
  const nameExistsInCategory = (
    type: "common" | "teacher",
    name: string,
    excludeKey?: string,
  ): boolean => {
    return Object.entries(documentTypes[type]).some(([key, existingName]) => {
      // Skip the current key being edited
      if (excludeKey && key === excludeKey) return false;
      return existingName.toLowerCase() === name.toLowerCase();
    });
  };

  // Check if a key already exists in a category
  const keyExistsInCategory = (
    type: "common" | "teacher",
    key: string,
  ): boolean => {
    return !!documentTypes[type][key];
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    const trimmedName = newCategoryName.trim();
    // Generate key from name
    const generatedKey = generateKeyFromName(trimmedName);

    if (generatedKey.length === 0) {
      setError(
        "Invalid category name. Please use letters, numbers, and spaces.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Check if the name already exists
      if (nameExistsInCategory(newCategoryType, trimmedName)) {
        setError(`A category with name "${trimmedName}" already exists`);
        return;
      }

      // Check if the key already exists
      if (keyExistsInCategory(newCategoryType, generatedKey)) {
        setError(`A category with key "${generatedKey}" already exists`);
        return;
      }

      // Add the new category
      const newDocTypes = { ...documentTypes };
      newDocTypes[newCategoryType][generatedKey] = trimmedName;

      // Update in Firebase
      await set(ref(database, "documentTypes"), newDocTypes);

      // Update state
      setDocumentTypes(newDocTypes);
      setNewCategoryName("");
      setSuccess(`Category "${trimmedName}" added successfully`);
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (
    type: "common" | "teacher",
    key: string,
    name: string,
  ) => {
    setEditingCategory({ type, key, name, originalName: name });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const trimmedName = editingCategory.name.trim();
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Check if the name already exists
      if (
        trimmedName.toLowerCase() !==
          editingCategory.originalName.toLowerCase() &&
        nameExistsInCategory(
          editingCategory.type,
          trimmedName,
          editingCategory.key,
        )
      ) {
        setError(`A category with name "${trimmedName}" already exists`);
        setLoading(false);
        return;
      }

      // Update the category
      const newDocTypes = { ...documentTypes };
      newDocTypes[editingCategory.type][editingCategory.key] = trimmedName;

      // Update in Firebase
      await update(ref(database, `documentTypes/${editingCategory.type}`), {
        [editingCategory.key]: trimmedName,
      });

      // Update state
      setDocumentTypes(newDocTypes);
      setEditingCategory(null);
      setSuccess("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (
    type: "common" | "teacher",
    key: string,
    name: string,
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the category "${name}"? Documents of this type will retain the category name but may not be properly categorized in the future.`,
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Delete the category
      const newDocTypes = { ...documentTypes };
      delete newDocTypes[type][key];

      // Update in Firebase
      await remove(ref(database, `documentTypes/${type}/${key}`));

      // Update state
      setDocumentTypes(newDocTypes);
      setSuccess(`Category "${name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get category entries sorted by name
  const getSortedCategories = (type: "common" | "teacher") => {
    return Object.entries(documentTypes[type] || {}).sort(
      ([, nameA], [, nameB]) => nameA.localeCompare(nameB),
    );
  };

  return (
    <div
      className="card rounded-lg shadow-lg border p-6"
      style={{ 
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-primary)"
      }}
      data-oid="7rill9s"
    >
      <h2 
        className="text-xl font-bold mb-4" 
        style={{ color: "var(--color-text-primary)" }}
        data-oid="gb47eav"
      >
        Document Categories
      </h2>

      {error && (
        <div
          className="status-rejected px-4 py-3 rounded mb-4"
          data-oid="6gj_opg"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="status-approved px-4 py-3 rounded mb-4"
          data-oid="ay5mv8k"
        >
          {success}
        </div>
      )}

      {/* Add new category form */}
      <div
        className="mb-8 p-4 rounded border"
        style={{ 
          backgroundColor: "var(--color-bg-accent)",
          borderColor: "var(--color-border)"
        }}
        data-oid=":.3lsvm"
      >
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--color-text-primary)" }}
          data-oid="-266toz"
        >
          Add New Category
        </h3>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          data-oid="w74k6hf"
        >
          <div data-oid="c56na43">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
              data-oid="cqkl8x5"
            >
              Category Type
            </label>
            <select
              className="input-field w-full"
              style={{
                backgroundColor: "var(--color-input)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)"
              }}
              value={newCategoryType}
              onChange={(e) =>
                setNewCategoryType(e.target.value as "common" | "teacher")
              }
              disabled={loading}
              data-oid="1y_nz6m"
            >
              <option value="common" data-oid="f_w6gew">
                Common (All Staff)
              </option>
              <option value="teacher" data-oid="taa93wp">
                Teacher-Specific
              </option>
            </select>
          </div>
          
          <div data-oid="wfrdbjv">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
              data-oid="s.1uc-v"
            >
              Category Name
            </label>
            <input
              type="text"
              className="input-field w-full"
              style={{
                backgroundColor: "var(--color-input)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)"
              }}
              placeholder="e.g. Disciplinary Reports"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={loading}
              data-oid="0z_g2lj"
            />
          </div>
        </div>

        <div className="flex justify-end" data-oid="_91g2k-">
          <button
            className="btn btn-primary"
            onClick={handleAddCategory}
            disabled={loading || !newCategoryName.trim()}
            data-oid="t1yt9v1"
          >
            Add Category
          </button>
        </div>
      </div>

      {loading &&
      !Object.keys(documentTypes.common).length &&
      !Object.keys(documentTypes.teacher).length ? (
        <div className="flex justify-center py-8" data-oid="4k1uz8-">
          <div
            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
            style={{ borderColor: "var(--color-primary)" }}
            data-oid="e-ra4dl"
          ></div>
        </div>
      ) : (
        <div className="mb-8" data-oid="0g953i7">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
            data-oid="bfxj.ra"
          >
            Current Categories
          </h3>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            data-oid="kle:y8i"
          >
            {/* Common Categories */}
            <div
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: "var(--color-bg-accent)",
                borderColor: "var(--color-border)"
              }}
              data-oid="5cm-s.w"
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--color-primary)" }}
                data-oid="n1t-.n_"
              >
                Common Categories
              </h4>
              <p 
                className="text-sm mb-3"
                style={{ color: "var(--color-text-muted)" }}
                data-oid="3k9c9ck"
              >
                These categories are available to all users
              </p>

              <div
                className="rounded shadow overflow-hidden"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
                data-oid="4zl1-jr"
              >
                <table className="min-w-full" data-oid="x-yp2f7">
                  <thead 
                    style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.05)" }}
                    data-oid="6jthsfi"
                  >
                    <tr data-oid="t6wt3p_">
                      <th
                        className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider w-1/3"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="vxh7n-x"
                      >
                        Key
                      </th>
                      <th
                        className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="nz_3bcc"
                      >
                        Display Name
                      </th>
                      <th
                        className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider w-1/4"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="v8wfik-"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "var(--color-border)" }}
                    data-oid="k9:1pk2"
                  >
                    {getSortedCategories("common").map(([key, name]) => (
                      <tr
                        key={key}
                        className="hover:bg-gray-50"
                        data-oid="akq8s7s"
                      >
                        <td
                          className="py-2 px-4 text-xs font-mono"
                          style={{ color: "var(--color-text-muted)" }}
                          data-oid="lomn..y"
                        >
                          {key}
                        </td>
                        <td
                          className="py-2 px-4 text-sm"
                          style={{ color: "var(--color-text-primary)" }}
                          data-oid="1yu3_xe"
                        >
                          {editingCategory &&
                          editingCategory.type === "common" &&
                          editingCategory.key === key ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              style={{
                                backgroundColor: "var(--color-input)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-primary)"
                              }}
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  name: e.target.value,
                                })
                              }
                              disabled={loading}
                              data-oid="m4hupfn"
                            />
                          ) : (
                            name
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm" data-oid="3fc08nx">
                          {editingCategory &&
                          editingCategory.type === "common" &&
                          editingCategory.key === key ? (
                            <div className="flex space-x-2" data-oid="fd4q7sl">
                              <button
                                className="btn btn-success rounded px-2 py-1 text-xs"
                                style={{
                                  opacity: loading || !editingCategory.name.trim() ? "0.5" : "1"
                                }}
                                onClick={handleUpdateCategory}
                                disabled={
                                  loading || !editingCategory.name.trim()
                                }
                                data-oid="25ptw8k"
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-secondary rounded px-2 py-1 text-xs"
                                onClick={() => setEditingCategory(null)}
                                disabled={loading}
                                data-oid="k_h:.nk"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2" data-oid="s3avcym">
                              <button
                                className="btn btn-primary rounded px-2 py-1 text-xs"
                                onClick={() =>
                                  handleEditCategory("common", key, name)
                                }
                                disabled={loading}
                                title="Edit category name"
                                data-oid="pjsqsiu"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger rounded px-2 py-1 text-xs"
                                onClick={() =>
                                  handleDeleteCategory("common", key, name)
                                }
                                disabled={loading}
                                title="Delete this category"
                                data-oid="6fx9nga"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(documentTypes.common).length === 0 && (
                      <tr data-oid=".p6hi9-">
                        <td
                          colSpan={3}
                          className="py-4 text-center"
                          style={{ color: "var(--color-text-muted)" }}
                          data-oid="2md.0nl"
                        >
                          No common categories defined
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Categories */}
            <div
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: "var(--color-bg-accent)",
                borderColor: "var(--color-border)"
              }}
              data-oid="r7sjy9u"
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--color-success)" }}
                data-oid="qznngvh"
              >
                Teacher-Specific Categories
              </h4>
              <p 
                className="text-sm mb-3"
                style={{ color: "var(--color-text-muted)" }}
                data-oid="wv6zjyr"
              >
                These categories are only available to teacher accounts
              </p>

              <div
                className="rounded shadow overflow-hidden"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
                data-oid="32qdy2y"
              >
                <table className="min-w-full" data-oid="b0f2ue5">
                  <thead 
                    style={{ backgroundColor: "rgba(var(--color-success-rgb), 0.05)" }}
                    data-oid="6a8bx88"
                  >
                    <tr data-oid="x9zklum">
                      <th
                        className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider w-1/3"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="m:nnr_k"
                      >
                        Key
                      </th>
                      <th
                        className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="s8exheu"
                      >
                        Display Name
                      </th>
                      <th
                        className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider w-1/4"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="_atr3t."
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "var(--color-border)" }}
                    data-oid=".a08xzj"
                  >
                    {getSortedCategories("teacher").map(([key, name]) => (
                      <tr
                        key={key}
                        className="hover:bg-gray-50"
                        data-oid="bv8dm64"
                      >
                        <td
                          className="py-2 px-4 text-xs font-mono"
                          style={{ color: "var(--color-text-muted)" }}
                          data-oid="6.1w_x1"
                        >
                          {key}
                        </td>
                        <td
                          className="py-2 px-4 text-sm"
                          style={{ color: "var(--color-text-primary)" }}
                          data-oid="adripo0"
                        >
                          {editingCategory &&
                          editingCategory.type === "teacher" &&
                          editingCategory.key === key ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              style={{
                                backgroundColor: "var(--color-input)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-primary)"
                              }}
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  name: e.target.value,
                                })
                              }
                              disabled={loading}
                              data-oid="ks:xm-0"
                            />
                          ) : (
                            name
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm" data-oid="fopq9bd">
                          {editingCategory &&
                          editingCategory.type === "teacher" &&
                          editingCategory.key === key ? (
                            <div className="flex space-x-2" data-oid="wkpfvsd">
                              <button
                                className="btn btn-success rounded px-2 py-1 text-xs"
                                style={{
                                  opacity: loading || !editingCategory.name.trim() ? "0.5" : "1"
                                }}
                                onClick={handleUpdateCategory}
                                disabled={
                                  loading || !editingCategory.name.trim()
                                }
                                data-oid="j:7pjjp"
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-secondary rounded px-2 py-1 text-xs"
                                onClick={() => setEditingCategory(null)}
                                disabled={loading}
                                data-oid="t9xewzj"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2" data-oid="3-tqe29">
                              <button
                                className="btn btn-primary rounded px-2 py-1 text-xs"
                                onClick={() =>
                                  handleEditCategory("teacher", key, name)
                                }
                                disabled={loading}
                                title="Edit category name"
                                data-oid="im7.qil"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger rounded px-2 py-1 text-xs"
                                onClick={() =>
                                  handleDeleteCategory("teacher", key, name)
                                }
                                disabled={loading}
                                title="Delete this category"
                                data-oid="04gva58"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(documentTypes.teacher).length === 0 && (
                      <tr data-oid="n3dfp12">
                        <td
                          colSpan={3}
                          className="py-4 text-center"
                          style={{ color: "var(--color-text-muted)" }}
                          data-oid="d77ctxs"
                        >
                          No teacher categories defined
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
    </div>
  );
}
