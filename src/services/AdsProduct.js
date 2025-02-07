import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdsProduct from '@/models/AdsProduct';

export class AdsProductService {
  static async getAllAdsProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'AdsProduct'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching ads products:', error);
      throw new Error('Failed to fetch ads products');
    }
  }

  static async createAdsProduct({ productId, sponsorTypes }) {
    try {
      // Validate sponsor types
      const validatedSponsorTypes = sponsorTypes.map(sponsor => {
        // Convert the type to uppercase for comparison
        const sponsorTypeKey = Object.keys(AdsProduct.SPONSOR_TYPES)
          .find(key => AdsProduct.SPONSOR_TYPES[key] === sponsor.type);
        
        const priorityLevelKey = Object.keys(AdsProduct.PRIORITY_LEVELS)
          .find(key => AdsProduct.PRIORITY_LEVELS[key] === sponsor.priorityLevel);

        if (!sponsorTypeKey) {
          throw new Error(`Invalid sponsor type: ${sponsor.type}`);
        }
        if (!priorityLevelKey) {
          throw new Error(`Invalid priority level: ${sponsor.priorityLevel}`);
        }

        return {
          type: sponsor.type,
          priorityLevel: sponsor.priorityLevel
        };
      });

      const adsProduct = new AdsProduct({
        productId,
        sponsorTypes: validatedSponsorTypes
      });

      // Use productId as document ID
      const docRef = doc(db, 'AdsProduct', productId);
      await setDoc(docRef, adsProduct.toFirestore());

      return {
        id: productId,
        ...adsProduct.toFirestore()
      };
    } catch (error) {
      console.error('Error creating ads product:', error);
      throw new Error(`Failed to create ads product: ${error.message}`);
    }
  }

  static async updateAdsProduct(productId, { sponsorTypes }) {
    try {
      const validatedSponsorTypes = sponsorTypes.map(sponsor => {
        const sponsorTypeKey = Object.keys(AdsProduct.SPONSOR_TYPES)
          .find(key => AdsProduct.SPONSOR_TYPES[key] === sponsor.type);
        
        const priorityLevelKey = Object.keys(AdsProduct.PRIORITY_LEVELS)
          .find(key => AdsProduct.PRIORITY_LEVELS[key] === sponsor.priorityLevel);

        if (!sponsorTypeKey) {
          throw new Error(`Invalid sponsor type: ${sponsor.type}`);
        }
        if (!priorityLevelKey) {
          throw new Error(`Invalid priority level: ${sponsor.priorityLevel}`);
        }

        return {
          type: sponsor.type,
          priorityLevel: sponsor.priorityLevel
        };
      });

      const docRef = doc(db, 'AdsProduct', productId);
      await setDoc(docRef, {
        sponsorTypes: validatedSponsorTypes,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return {
        id: productId,
        sponsorTypes: validatedSponsorTypes
      };
    } catch (error) {
      console.error('Error updating ads product:', error);
      throw new Error('Failed to update ads product');
    }
  }

  static async deleteAdsProduct(productId) {
    try {
      await deleteDoc(doc(db, 'AdsProduct', productId));
    } catch (error) {
      console.error('Error deleting ads product:', error);
      throw new Error('Failed to delete ads product');
    }
  }

  static async getAdsProductById(productId) {
    try {
      const docRef = doc(db, 'AdsProduct', productId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Ads product not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error fetching ads product:', error);
      throw new Error('Failed to fetch ads product');
    }
  }
}
