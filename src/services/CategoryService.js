import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Category from '@/models/Category';

export class CategoryService {
  /**
   * Fetch all categories from Firestore
   * @returns {Promise<Array>} Array of categories with their IDs
   */
  static async getAllCategories() {
    const querySnapshot = await getDocs(collection(db, 'Category'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data including tag and image file
   * @returns {Promise<string>} ID of the created category
   */
  static async createCategory({ tag, imageFile }) {
    let imageUri = '';
    
    if (imageFile) {
      imageUri = await this.uploadImage(imageFile,tag);
    }

    const category = new Category({ tag, imageUri });
    const docRef = await addDoc(collection(db, 'Category'), category.toFirestore());
    return docRef.id;
  }

  /**
   * Update an existing category
   * @param {string} categoryId - ID of the category to update
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<void>}
   */
  static async updateCategory(categoryId, { tag, imageFile, currentImageUri }) {
    let imageUri = currentImageUri;

    if (imageFile) {
      imageUri = await this.uploadImage(imageFile,tag);
    }

    const category = new Category({ tag, imageUri });
    await updateDoc(doc(db, 'Category', categoryId), category.toFirestore());
  }

  /**
   * Delete a category
   * @param {string} categoryId - ID of the category to delete
   * @returns {Promise<void>}
   */
  static async deleteCategory(categoryId) {
    await deleteDoc(doc(db, 'Category', categoryId));
  }

  /**
   * Upload an image to Firebase Storage
   * @param {File} imageFile - Image file to upload
   * @param {string} tag - Tag of the category
   * @returns {Promise<string>} Download URL of the uploaded image
   * @private
   */
  static async uploadImage(imageFile,tag) {
    const storageRef = ref(storage, `Categorys/${Date.now()}-${tag}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  }
} 