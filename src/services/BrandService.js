import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Brand from '@/models/Brand';

export class BrandService {
  /**
   * Fetch all brands from Firestore
   * @returns {Promise<Array>} Array of brands
   */
  static async getAllBrands() {
    try {
      const querySnapshot = await getDocs(collection(db, 'brand'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new Error('Failed to fetch brands');
    }
  }

  /**
   * Create a new brand
   * @param {Object} brandData - Brand data including brandName and image file
   * @returns {Promise<Object>} Created brand data
   */
  static async createBrand({ brandName, imageFile }) {
    try {
      let brandIcon = '';
      
      if (imageFile) {
        const storageRef = ref(storage, `brand/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        brandIcon = await getDownloadURL(storageRef);
      }

      const brand = new Brand({
        brandName,
        brandIcon,
        createdAt: new Date().toISOString()
      });

      const brandRef = doc(db, 'brand', brandName);
      await setDoc(brandRef, brand.toFirestore());
      return { id: brandName, ...brand };
    } catch (error) {
      console.error('Error creating brand:', error);
      throw new Error('Failed to create brand');
    }
  }

  /**
   * Update an existing brand
   * @param {string} brandId - ID of the brand to update
   * @param {Object} updateData - Updated brand data
   * @returns {Promise<void>}
   */
  static async updateBrand(brandId, { brandName, imageFile, currentBrandIcon }) {
    try {
      let brandIcon = currentBrandIcon;

      if (imageFile) {
        if (currentBrandIcon) {
          try {
            const oldImageRef = ref(storage, currentBrandIcon);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }

        const storageRef = ref(storage, `brand/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        brandIcon = await getDownloadURL(storageRef);
      }

      const brand = new Brand({
        brandName,
        brandIcon,
        updatedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'brand', brandId), brand.toFirestore());
      return { id: brandId, ...brand };
    } catch (error) {
      console.error('Error updating brand:', error);
      throw new Error('Failed to update brand');
    }
  }

  /**
   * Delete a brand
   * @param {string} brandId - ID of the brand to delete
   * @param {string} brandIcon - URL of the brand icon to delete
   * @returns {Promise<void>}
   */
  static async deleteBrand(brandId, brandIcon) {
    try {
      if (brandIcon) {
        try {
          const imageRef = ref(storage, brandIcon);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting brand icon:', error);
        }
      }

      await deleteDoc(doc(db, 'brand', brandId));
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw new Error('Failed to delete brand');
    }
  }

  /**
   * Get a single brand by ID
   * @param {string} brandId - ID of the brand to fetch
   * @returns {Promise<Object>} Brand data
   */
  static async getBrandById(brandId) {
    try {
      const brandDoc = await getDoc(doc(db, 'brand', brandId));
      if (!brandDoc.exists()) {
        throw new Error('Brand not found');
      }
      return {
        id: brandDoc.id,
        ...brandDoc.data()
      };
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw new Error('Failed to fetch brand');
    }
  }
} 