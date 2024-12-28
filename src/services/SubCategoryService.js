import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SubCategory from '@/models/SubCategory';

export class SubCategoryService {
  static async getAllSubCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, 'subCategory'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw new Error('Failed to fetch subcategories');
    }
  }

  static async createSubCategory(subCategoryData) {
    try {
      const subCategory = new SubCategory(subCategoryData);
      const docRef = await addDoc(collection(db, 'subCategory'), subCategory.toFirestore());
      return {
        id: docRef.id,
        ...subCategory.toFirestore()
      };
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw new Error('Failed to create subcategory');
    }
  }

  static async updateSubCategory(id, subCategoryData) {
    try {
      const subCategory = new SubCategory(subCategoryData);
      await updateDoc(doc(db, 'subCategory', id), subCategory.toFirestore());
      return {
        id,
        ...subCategory.toFirestore()
      };
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw new Error('Failed to update subcategory');
    }
  }

  static async deleteSubCategory(id) {
    try {
      await deleteDoc(doc(db, 'subCategory', id));
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw new Error('Failed to delete subcategory');
    }
  }
} 